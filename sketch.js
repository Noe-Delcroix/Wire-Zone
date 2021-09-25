/*TODO
	Wifi

	fix crash when holding mouse and switching mode at the same time
*/

var grid
var gsize

//0:edit 1:select
var mode=0
var lastRotation=0
var blockPool=[]

var selectedBlock=0
var selection=[]

var pasting=false
var clipBoard=[]

var cam
var zoom = 50
var mouse

const KCfreecam=16
const KCchangemode=32
const KCescape=27

const KCsuppr=46
const KCfill=70
const KCcopy=67
const KCcut=88
const KCpaste=86

function disableRightClickContextMenu(element) {
	element.addEventListener('contextmenu', function(e) {
		if (e.button == 2) {
			e.preventDefault();
		}
	});
}

function setup() {
	canvas = createCanvas(windowWidth, windowHeight);
	disableRightClickContextMenu(canvas.elt)
	createGrid(1,1)
	cam = createVector(-width/zoom/2,-height/zoom/2)
	mouse=createVector()

	blockPool.push( new Tile( 0,0,0,"Wire",0,[[2,0],[1,0],[1,1],[1,2]],0,[[0],[1],[1],[1],[1],[1],[1],[1]]  ))
	blockPool.push( new Tile( 0,0,0,"Multi-Wire",0,[[2,0],[2,1],[1,0],[2,2]],0,[[0,0,0],[1,1,1]]  ))
	blockPool.push( new Tile( 0,0,0,"Cross Wire A",0,[[2,0],[2,1],[1,0],[1,1]],0,[[0,0],[1,0],[0,1],[1,1]]  ))
	blockPool.push( new Tile( 0,0,0,"Cross Wire B",0,[[2,0],[1,1],[1,0],[2,1]],0,[[0,0],[1,0],[0,1],[1,1]]  ))

	blockPool.push( new Tile( 0,0,0,"Switch",0,[[2,0],[2,1],[2,2],[2,3]],3,[],true  ))
	blockPool.push( new Tile( 0,0,0,"Button",60,[[2,0],[2,1],[2,2],[2,3]],3,[],true  ))
	blockPool.push( new Tile( 0,0,0,"Lamp",0,[[2,0],[1,0],[1,1],[1,2]],2,[[0],[1],[1],[1],[1],[1],[1],[1]]  ))

	blockPool.push( new Tile( 0,0,0,"NOT Gate",1,[[2,0],[0,0],[1,0],[0,0]],1,[[1],[0]]  ))
	blockPool.push( new Tile( 0,0,0,"AND Gate",1,[[2,0],[1,0],[0,0],[1,1]],1,[[0],[0],[0],[1]]  ))
	blockPool.push( new Tile( 0,0,0,"XOR Gate",1,[[2,0],[1,0],[0,0],[1,1]],1,[[0],[1],[1],[0]]  ))



}

function createGrid(w, h) {
	gsize = createVector(w, h)
	grid = []
	for (let y = 0; y < gsize.y; y++) {
		grid[y] = []
		for (let x = 0; x < gsize.x; x++) {
			grid[y][x] = null
		}
	}
}


function tickGrid(){
	for (let y=0;y<gsize.y;y++){
		for (let x=0;x<gsize.x;x++){
			if (grid[y][x]){
				grid[y][x].tick()
			}
		}
	}

}



function isInSelection(x,y){
	if (selection.length==0){
		return false
	}
	return (x>=min(selection[0].x,selection[1].x) &&
					x<=max(selection[0].x,selection[1].x) &&
					y>=min(selection[0].y,selection[1].y) &&
					y<=max(selection[0].y,selection[1].y)) 
}
function getSelectionCorners(cons=true){
	let topleft=createVector()
	topleft.x=min(selection[0].x,selection[1].x)
	topleft.y=min(selection[0].y,selection[1].y)
	let bottomright=createVector()
	bottomright.x=max(selection[0].x,selection[1].x)
	bottomright.y=max(selection[0].y,selection[1].y)

	if (cons){
		topleft.x=max(0,topleft.x)
		topleft.y=max(0,topleft.y)
		bottomright.x=min(gsize.x,bottomright.x)
		bottomright.y=min(gsize.y,bottomright.y)
	}

	return [topleft,bottomright]
}

function fillSelection(tile){
	if (selection.length!=0){
		let topleft=getSelectionCorners()[0]
		let bottomright=getSelectionCorners()[1]

		for (let y=bottomright.y;y>=topleft.y;y--){
			for (let x=bottomright.x;x>=topleft.x;x--){
				placeTile(x,y,tile)
			}	
		}
	}
}

function copySelection(){
	let cb=[]
	let topleft=getSelectionCorners()[0]
	let bottomright=getSelectionCorners()[1]


	for (let y=topleft.y;y<=bottomright.y;y++){
		cb[y-topleft.y]=[]
		for (let x=topleft.x;x<=bottomright.x;x++){
			if (grid[y][x]==null){
				cb[y-topleft.y][x-topleft.x]=null
			}else{
				cb[y-topleft.y][x-topleft.x]=grid[y][x].clone(x-topleft.x,y-topleft.y)
			}
		}
	}
	clipBoard=cb.slice()
}

function isInClipBoardArea(x,y){
	if (clipBoard.length==0){
		return false
	}
	return (x>=mouse.x && y>=mouse.y && x<mouse.x+clipBoard[0].length && y<mouse.y+clipBoard.length)
}

function pasteClipboard(replace=false){
	if (clipBoard.length>0){
		for (let y=0;y<clipBoard.length;y++){
			for (let x=0;x<clipBoard[0].length;x++){
				if (clipBoard[y][x]!=null || replace){
					placeTile(x+mouse.x,y+mouse.y,clipBoard[y][x],clipBoard[y][x].rotation)
				}
			}
		}
	}
}

function rotateClipboard(clockwise){
	let newClipBoard=[]
	for (let y=0;y<clipBoard[0].length;y++){
		newClipBoard[y]=[]
		for (let x=0;x<clipBoard.length;x++){
			let c
			if (clockwise){
				c=clipBoard[x][clipBoard[0].length-1-y]
			}else{
				c=clipBoard[clipBoard.length-1-x][y]
			}
				
			if (c!=null){
				newClipBoard[y][x]=c.clone(x,y)
				if (clockwise){
					newClipBoard[y][x].rotation=(newClipBoard[y][x].rotation+1)%4
				}else{
					if (newClipBoard[y][x].rotation==0){
						newClipBoard[y][x].rotation=3
					}else{
						newClipBoard[y][x].rotation--
					}
				}
			}else{
				newClipBoard[y][x]=null
			}
		}	
	}
	clipBoard=newClipBoard.slice()
}

function flipClipboard(){
	let newClipBoard=[]
	for (let y=0;y<clipBoard.length;y++){
		newClipBoard[y]=[]
		for (let x=0;x<clipBoard[0].length;x++){
			let c=clipBoard[y][clipBoard[0].length-1-x]
			if (c==null){
				newClipBoard[y][x]=null
			}else{
				newClipBoard[y][x]=c.clone(x,y)
				if (newClipBoard[y][x].rotation==1){
					newClipBoard[y][x].rotation=3
				}else if (newClipBoard[y][x].rotation==3){
					newClipBoard[y][x].rotation=1
				}
			}
		}
	}
	clipBoard=newClipBoard.slice()
}

function pickBloc(){
	if (mouseOnScreen() && grid[mouse.y][mouse.x]!=null){
		for (let b=0;b<blockPool.length;b++){
			if (blockPool[b].name==grid[mouse.y][mouse.x].name){
				selectedBlock=b
				lastRotation=grid[mouse.y][mouse.x].rotation
				return
			}
		}
	}
}

function resizeGrid(fx,fy){
	let negx=0;let posx=0
	if (fx<0){
		negx=abs(fx)
	}else if (fx>=gsize.x){
		posx=fx-gsize.x+1
	}
	let negy=0;let posy=0
	if (fy<0){
		negy=abs(fy)
	}else if (fy>=gsize.y){
		posy=fy-gsize.y+1
	}
	let newGrid=[]
	for (let y=-negy;y<gsize.y+posy;y++){
		newGrid[y+negy]=[]
		for (let x=-negx;x<gsize.x+posx;x++){
			if (x>=0 && y>=0 && x<gsize.x && y<gsize.y){
				newGrid[y+negy][x+negx]=grid[y][x]
				if (grid[y][x]!=null){
					newGrid[y+negy][x+negx].pos=createVector(x+negx,y+negy)
				}
			}else{
				newGrid[y+negy][x+negx]=null
			}
		}
	}
	grid=newGrid.slice()
	gsize=createVector(gsize.x+negx+posx,gsize.y+negy+posy)
	cam.add(createVector(negx,negy))
	for (let s of selection){
		s.add(createVector(negx,negy))
	}
	updateMouse()
	return createVector(negx,negy)
}

function resizeDown(){
	let topleft=createVector(gsize.x,gsize.y)
	for (let y=0;y<gsize.y;y++){
		for (let x=0;x<gsize.x;x++){
			if (grid[y][x]!=null){
				if (y<topleft.y){
					topleft.y=y
				}
				if (x<topleft.x){
					topleft.x=x
				}
			}
		}
	}
	let bottomright=createVector(0,0)
	for (let y=gsize.y-1;y>=0;y--){
		for (let x=gsize.x-1;x>=0;x--){
			if (grid[y][x]!=null){
				if (y>bottomright.y){
					bottomright.y=y
				}
				if (x>bottomright.x){
					bottomright.x=x
				}
			}
		}
	}
	bottomright.x++
	bottomright.y++
	if (topleft.x==bottomright.x || topleft.y==bottomright.y){
		topleft.x--;topleft.y--
	}

	let newGrid=[]
	for (let y=topleft.y;y<bottomright.y;y++){
		newGrid[y-topleft.y]=[]
		for (let x=topleft.x;x<bottomright.x;x++){
			newGrid[y-topleft.y][x-topleft.x]=grid[y][x]
			if (grid[y][x]!=null){
				newGrid[y-topleft.y][x-topleft.x].pos=createVector(x-topleft.x,y-topleft.y)
			}
		}
	}

	gsize=createVector(newGrid[0].length,newGrid.length)
	grid=newGrid.slice()
	cam.sub(createVector(topleft.x,topleft.y))
	updateMouse()
}

function placeTile(x,y,tile,rot=lastRotation){
	if (x<0 || y<0 || x>=gsize.x || y>=gsize.y){
		if (tile==null){
			return
		}
		let offset=resizeGrid(x,y)
		x+=offset.x
		y+=offset.y
	}

	if (grid[y][x]!=null && grid[y][x].toggleable && tile!=null){
		return
	}

	

	let prevOutputs=[]
	if (grid[y][x]!=null){
		prevOutputs=grid[y][x].getConnections(2,1)
	}

	if (tile==null){
		grid[y][x]=null
	}else{
		grid[y][x]=tile.clone(x,y)
		grid[y][x].rotation=rot
	}
	
	for (let p of prevOutputs){
		p.update()
	}
	
	if (grid[y][x]!=null){
		grid[y][x].update()
	}

	resizeDown()
}

function rotateTile(x,y,clockwise){
	let g=grid[y][x]
	if (g!=null){
		let prevOutputs=g.getConnections(2,1)
		if (clockwise){
			if (g.rotation==3){
				g.rotation=0
			}else{
				g.rotation++
			}
		}else{
			if (g.rotation==0){
				g.rotation=3
			}else{
				g.rotation--
			}
		}
		lastRotation=g.rotation
		
		for (let p of prevOutputs){
			p.update()
		}
		g.update()
	}
}

function toggleTile(x,y){
	let g=grid[y][x]
	if (g!=null && g.toggleable){
		if (g.delay==0){
			if (g.state.includes(1)){
				g.state=[0,0,0,0]
			}else{
				g.state=[1,1,1,1]
			}
			g.updateOutputs()
		}else{
			g.state=[1,1,1,1]
			g.update()
			g.updateOutputs()
		}
	}
}

function camControls() {
	if (keyIsDown(KCfreecam) && mouseIsPressed && mouseButton == LEFT) {
		cam.x+=(pmouseX - mouseX) / zoom
		cam.y+=(pmouseY - mouseY) / zoom
	} 
}

function stw(screenX, screenY) {
	return createVector(screenX / zoom + cam.x, screenY / zoom + cam.y)
}

function wts(worldX, worldY) {
	return createVector((worldX - cam.x) * zoom, (worldY - cam.y) * zoom)
}