function draw() {
	background(0)
	updateMouse()
	camControls()
	mouseControls()
	drawGrid(10)
	drawSelection()
	drawTiles(grid)
	drawClipboard()
	drawMenuTempo(10,10,100)
	tickGrid()
}

function drawSelection(){
	if (selection.length>0){
		let c=getSelectionCorners(false)
		let pos1=wts(c[0].x,c[0].y)
		let pos2=wts(c[1].x+1,c[1].y+1)

		noStroke()
		fill(0,128,255,60)
		rectMode(CORNERS)
		rect(pos1.x,pos1.y,pos2.x,pos2.y)

	}
}

function drawClipboard(){
	if (clipBoard.length>0 && pasting){
		noStroke()
		fill(0,255,0,15)
		rectMode(CORNERS)
		let pos1=wts(mouse.x,mouse.y)
		let pos2=wts(mouse.x+clipBoard[0].length,mouse.y+clipBoard.length)
		rect(pos1.x,pos1.y,pos2.x,pos2.y)
		for (let y=0;y<clipBoard.length;y++){
			for (let x=0;x<clipBoard[0].length;x++){
				if (clipBoard[y][x]!=null){
					let pos=wts(mouse.x+x+0.5,mouse.y+y+0.5)
					clipBoard[y][x].renderTile(pos.x,pos.y,zoom,false,clipBoard,255)
				}		
			}
		}
		
	}
}

function drawMenuTempo(fx,fy,fz){
	rectMode(CORNER)
	stroke(255)
	strokeWeight(2)
	fill(0,200)
	rect(fx,fy,fz,fz,fz/10)

	blockPool[selectedBlock].renderTile(fx+fz/2,fy+fz/2.5,fz/1.5,true,null,255)

	fill(255)
	noStroke()
	textAlign(CENTER,BOTTOM)
	textSize(fz/6)
	text(blockPool[selectedBlock].name,fx+fz/2,fy+fz)

}

function drawTiles(fg,opacity) {
  let topleft = stw(0, 0)
  let bottomright = stw(width, height)
  for (let y = constrain(floor(topleft.y), 0, fg.length); y < constrain(ceil(bottomright.y), 0, fg.length); y++) {
    for (let x = constrain(floor(topleft.x), 0, fg[0].length); x < constrain(ceil(bottomright.x), 0, fg[0].length); x++) {
      if (fg[y][x]!=null) {
      	let pos=wts(fg[y][x].pos.x+0.5,fg[y][x].pos.y+0.5)
      	let opacity=255
      	if (mode==1){
      		if (isInClipBoardArea(x,y) && pasting){
						opacity=20
      		}else if (isInSelection(x,y)){
      			opacity=100
      		}
      	}
        fg[y][x].renderTile(pos.x,pos.y,zoom,mode==1 && isInSelection(x,y),grid,opacity,zoom<10)
      }
    }
  }
}

function drawGrid(opacity) {
	stroke(opacity)
	strokeWeight(zoom / 20)
	let topleft = stw(0, 0)
	let bottomright = stw(width, height)

	for (let x = floor(topleft.x); x < ceil(bottomright.x); x++) {
		let posx=wts(x,0).x
		line(posx,0,posx,height)
	}
	for (let y = floor(topleft.y); y < ceil(bottomright.y); y++) {
		let posy=wts(0,y).y
		line(0,posy,width,posy)
	}

	if (mode==1){
		stroke(255,100)
		noFill()
		let pos1=wts (0,0)
		let pos2=wts(gsize.x,gsize.y)
		rectMode(CORNERS)
		rect(pos1.x,pos1.y,pos2.x,pos2.y)
	}
}