function updateMouse(){
  mouse=getMouse()
}
function getMouse(){
	let mousePos = stw(mouseX, mouseY)
	return createVector(floor(mousePos.x),floor(mousePos.y))	
}
function mouseOnScreen(){
	let mousePos=getMouse()
	return (mousePos.x>=0 && mousePos.y>=0 && mousePos.x<gsize.x && mousePos.y<gsize.y)
}

function mouseControls(){
	if (!keyIsDown(KCfreecam) && mouseIsPressed){
		if (mode==0){
			if (mouseButton==LEFT){
				placeTile(mouse.x,mouse.y,blockPool[selectedBlock])
			}else if(mouseButton==RIGHT){
				placeTile(mouse.x,mouse.y,null)
			}
		}else if (mode==1){
			if ( mouseButton==LEFT && !pasting){
				selection[1]=createVector(mouse.x,mouse.y)
			}
		}
	}
}

function mousePressed(){
	if (!keyIsDown(KCfreecam)){
		if (mode==0){
			if (mouseButton==LEFT){
				if (mouseOnScreen()){
					toggleTile(mouse.x,mouse.y)
				}
			}else if (mouseButton==CENTER){
				pickBloc()
			}
		}else if (mode==1){
			if (mouseButton==LEFT){
				if (pasting){
					pasteClipboard()
				}else{
					if (mouseOnScreen() && isInSelection(mouse.x,mouse.y) && grid[mouse.y][mouse.x]!=null){
						let m=stw(mouseX,mouseY).sub(mouse)
						if (m.y<1/3 && m.x>1/3 && m.x<2/3){
							grid[mouse.y][mouse.x].changeConnection(0)
						}else if (m.y>2/3 && m.x>1/3 && m.x<2/3){
							grid[mouse.y][mouse.x].changeConnection(2)
						}else if (m.x<1/3 && m.y>1/3 && m.y<2/3){
							grid[mouse.y][mouse.x].changeConnection(1)
						}else if (m.x>2/3 && m.y>1/3 && m.y<2/3){
							grid[mouse.y][mouse.x].changeConnection(3)
						}
					}
					selection=[createVector(mouse.x,mouse.y),createVector(mouse.x,mouse.y)]
					pickBloc()
				}
			}else if (mouseButton==CENTER){
				if (pasting){
					flipClipboard()
				}
			}
		}
	}
}

function mouseWheel(event) {
	if (keyIsDown(KCfreecam)){
	let previous = stw(mouseX, mouseY)
    if (event.delta < 0) {
      zoom *= 1.2
    } else {
      zoom *= 0.8
    }
    zoom = constrain(zoom, 2, min(width, height))
    let current = stw(mouseX, mouseY)
    cam.x += (previous.x - current.x)
    cam.y += (previous.y - current.y)
  }else if (mode==0){
  	if(mouseOnScreen() && grid[mouse.y][mouse.x]!=null){
  		rotateTile(mouse.x,mouse.y,event.delta>0)
  	}
  }else if (mode==1){
  	if (pasting){
  		rotateClipboard(event.delta>0)
  	}
  }
}

function keyPressed(){
	if (keyCode==KCchangemode){
		mode=(mode+1)%2
		selection=[]
		pasting=false
		print("Changed mode to : "+["edit","select"][mode])
	}else if (keyCode==39){
		selectedBlock=min(selectedBlock+1,blockPool.length-1)
	}else if (keyCode==37){
		selectedBlock=max(selectedBlock-1,0)
	}else if (keyCode==KCescape){
		if (pasting){
			pasting=false
		}else{
			selection=[]
		}
	}else if (keyCode==KCsuppr){
		fillSelection(null)
		selection=[]
	}else if (keyIsDown(17)){
		if (keyCode==KCfill){
			fillSelection(blockPool[selectedBlock])
		}
		if (keyCode==KCcut || keyCode==KCcopy){
			if (selection.length>0){
				copySelection()
			}
		}
		if (keyCode==KCcut){
			fillSelection(null)
			selection=[]
		}
		if (keyCode==KCpaste){
			pasting=true
			selection=[]
		}
	}
}