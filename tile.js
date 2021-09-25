class Tile{
	constructor(x,y,rotation,name,delay,connections,renderMode,rule,toggleable=false){
		this.pos=createVector(x,y)

		this.name=name

		this.delay=delay
		this.timer=-1

		// 0:nothing 1:input 2:output
		this.connections=connections
		this.connectionColors=[color(255,128,0),color(0,128,255),color(255,0,255),color(0,255,0)]


		this.state=[0,0,0,0]
		this.colors=[color(30),color(255,255,128),color(20)]

		this.rule=rule

		this.toggleable=toggleable

		//0:up 1:left 2:bottom 3:right
		this.rotation=rotation

		//0:wire 1:logic gate 2:lamp
		this.renderMode=renderMode
	}

	clone(x,y){
		return new Tile(x,y,this.rotation,this.name,this.delay,this.connections.slice(),this.renderMode,this.rule.slice(),this.toggleable)
	}

	update(forceUpdate=false){
		if (this.delay==0 || forceUpdate){				
			let prevState=this.state.slice()
			this.updateState()
			let equals=true
			for (let i=0;i<prevState.length;i++){
				if (prevState[i]!=this.state[i]){
					equals=false
					break
				}
			}
			if (!equals){
				this.updateOutputs()
			}
		}else{
			this.timer=this.delay-1
		}
	}

	updateState(){
		this.state=[0,0,0,0]
		let b=this.getBinaryInputState()
		for (let pos=0;pos<4;pos++){
			if (this.connections[this.mod(pos)][0]==2 && this.getConnectionsAmount()[1]>0){
				this.state[this.mod(pos)]=this.rule[b][this.connections[this.mod(pos)][1]]
			}else if (this.connections[this.mod(pos)][0]==1){
				let other=this.getNeighbor(pos)
				if (other && other.connections[other.mod(this.opposite(pos))][0]==2 && other.state[other.mod(this.opposite(pos))]==1){
					this.state[this.mod(pos)]=1
				}
			}
		}
	}

	updateOutputs(){
		for (let o of this.getConnections(2,1)){
			o.update()
		}
	}

	tick(){
		if (this.delay>0 && this.timer==0){
			this.update(true)
		}else{
			this.timer--
		}
	}

	renderTile(fx,fy,fz,renderConnections,fg,opacity,simplified=false){
		if (simplified){
			let colors=[this.colors[int(this.state.includes(1))],
									this.colors[2],
									this.colors[int(this.state.includes(1))],
									this.colors[2]]

			fill(colors[this.renderMode])
			noStroke()
			rectMode(CORNER)
			rect(fx-0.5,fy-0.5,fz,fz)
		}else{
			if (this.renderMode==0){
				this.renderWire(fx,fy,fz,opacity,fg)
			}else if(this.renderMode==1){
				this.renderGate(fx,fy,fz,opacity)
			}else if(this.renderMode==2){
				this.renderLamp(fx,fy,fz,opacity)
			}else if (this.renderMode==3){
				this.renderInput(fx,fy,fz,opacity)
			}
		}
		if (renderConnections){
			this.renderConnections(fx,fy,fz)
		}
	}


	renderWire(fx,fy,fz,opacity,fg){
		let c=this.colors[int(this.state.includes(1))]
		fill(red(c),green(c),blue(c),opacity)
		noStroke()
		rectMode(CENTER)
		rect(fx,fy,fz/2.95,fz/2.95)

		for (let pos=0;pos<4;pos++){
			push()
			let angle = map(pos, 4, 0, -PI / 2, TWO_PI - PI / 2)
			translate(fx, fy)
			rotate(angle)
			translate(fz / 3, 0)

			if (this.connectedWith(pos,(this.getConnectionsAmount()[2]>1)*2,fg)){
				let c=this.colors[this.state[this.mod(pos)]]
        fill(red(c),green(c),blue(c),opacity)
				rect(0,0,fz/2.95,fz/2.95)
			}

			if (this.getConnectionsAmount()[2]<=1){
        translate(-fz/3,0)
      } 
      if (this.connections[this.mod(pos)][0]==2){
        let c=this.colors[abs(this.state[this.mod(pos)]-1)]
        fill(red(c),green(c),blue(c),opacity)
        triangle(-fz/15,fz/15,-fz/15,-fz/15,fz/15,0)
      }
      if (this.getConnectionsAmount()[2]<=1){
        translate(fz/3,0)
      }
			
			pop()
		}
	}

	renderGate(fx,fy,fz,opacity){
		let c=this.colors[2]
		fill(red(c),green(c),blue(c),opacity)
		stroke(red(c)/1.5,green(c)/1.5,blue(c)/1.5,opacity)
		strokeWeight(fz/20)
		rectMode(CENTER)
		rect(fx,fy,fz-fz/20,fz-fz/20)
		noStroke()

		for (let pos=0;pos<4;pos++){
			push()
			let angle = map(pos, 4, 0, -PI / 2, TWO_PI - PI / 2)
			translate(fx, fy)
			rotate(angle)
			translate(fz / 3, 0)

			let c=this.colors[this.state[this.mod(pos)]]
      fill(red(c),green(c),blue(c),opacity)
      if (this.connections[this.mod(pos)][0]==2){
        
        triangle(-fz/10,fz/10,-fz/10,-fz/10,fz/10,0)
      }else if(this.connections[this.mod(pos)][0]==1){
				triangle(fz/10,fz/10,fz/10,-fz/10,-fz/10,0)
      }
			pop()
		}

		c=this.colors[0]
		fill(red(c),green(c),blue(c),opacity)
		textAlign(CENTER,CENTER)
		textSize(fz/5)
		stroke(red(c),green(c),blue(c),opacity)
		strokeWeight(fz/50)
		text(this.name.split(" ")[0],fx,fy)
	}

	renderLamp(fx,fy,fz,opacity){
		let c=this.colors[int(this.state.includes(1))]
		fill(red(c),green(c),blue(c),opacity)
		stroke(red(c)/1.5,green(c)/1.5,blue(c)/1.5,opacity)
		strokeWeight(fz/8)
		rectMode(CENTER)
		rect(fx,fy,fz-fz/8,fz-fz/8)
		noStroke()

		for (let pos=0;pos<4;pos++){
			push()
			let angle = map(pos, 4, 0, -PI / 2, TWO_PI - PI / 2)
			translate(fx, fy)
			rotate(angle)
			translate(fz / 2.5, 0)
      if (this.connections[this.mod(pos)][0]==2){
        triangle(-fz/10,fz/10,-fz/10,-fz/10,fz/10,0)
      }
			pop()
		}

		if (this.getConnectionsAmount()[1]==0 && this.toggleable){
      let c=this.colors[int(!this.state.includes(1))]
      stroke(red(c),green(c),blue(c),opacity)	
      strokeWeight(fz/20)
      line(fx+fz/5,fy,fx-fz/5,fy)
      line(fx,fy+fz/5,fx,fy-fz/5)
    }

	}

	renderInput(fx,fy,fz,opacity){
		let s=fz/20
		let c=this.colors[2]
		fill(red(c),green(c),blue(c),opacity)
		stroke(red(c)*1.5,green(c)*1.5,blue(c)*1.5,opacity)
		strokeWeight(s)
		rectMode(CENTER)
		beginShape()
		vertex(fx-fz/6,fy-fz/2+s/2)
		vertex(fx+fz/6,fy-fz/2+s/2)
		vertex(fx+fz/2-s/2,fy-fz/6)
		vertex(fx+fz/2-s/2,fy+fz/6)
		vertex(fx+fz/6,fy+fz/2-s/2)
		vertex(fx-fz/6,fy+fz/2-s/2)
		vertex(fx-fz/2+s/2,fy+fz/6)
		vertex(fx-fz/2+s/2,fy-fz/6)
		endShape(CLOSE)
		noStroke()

		c=this.colors[int(this.state.includes(1))]
		if (this.delay==0){
			stroke(red(c),green(c),blue(c),opacity)
			strokeWeight(fz/10)
			line(fx,fy-fz/4,fx,fy+fz/4)
			line(fx-fz/4,fy,fx+fz/4,fy)
		}else{
			fill(red(c),green(c),blue(c),opacity)
			noStroke()
			rect(fx,fy,fz/3,fz/3,fz/20)
		}
	}

	renderConnections(fx,fy,fz){
		for (let pos=0;pos<4;pos++){
			push()
			let angle = map(pos, 4, 0, -PI / 2, TWO_PI - PI / 2)
			translate(fx, fy)
			rotate(angle)
			translate(fz / 3, 0)
			noStroke()
			fill(this.connectionColors[this.connections[this.mod(pos)][1]]) 
			if (this.connections[this.mod(pos)][0] == 1) {
				circle(0,0,fz/6)
			}else if (this.connections[this.mod(pos)][0] == 2){
				triangle(-fz / 8, -fz / 8, -fz / 8, fz / 8, fz / 8, 0)
			}
			pop()
		}
	}

	getConnectionsAmount(){
		let res=[0,0,0]
		for (let i=0;i<this.connections.length;i++){
			res[this.connections[i][0]]++
		}
		return res
	}

	getNeighbor(pos,fg=grid){
		if (fg==null){
			return null
		}
		if (pos==0 && this.pos.y!=0 && fg[this.pos.y-1][this.pos.x]){
			return fg[this.pos.y-1][this.pos.x]
		}
		if (pos==1 && this.pos.x!=0 && fg[this.pos.y][this.pos.x-1]){
			return fg[this.pos.y][this.pos.x-1]
		}
		if (pos==2 && this.pos.y!=fg.length-1 && fg[this.pos.y+1][this.pos.x]){
			return fg[this.pos.y+1][this.pos.x]
		}
		if (pos==3 && this.pos.x!=fg[0].length-1 && fg[this.pos.y][this.pos.x+1]){
			return fg[this.pos.y][this.pos.x+1]
		}
		return null
	}

	mod(pos){
		return (pos-this.rotation+4)%4
	}

	connectedWith(pos,alwaystrue,fg){
		let other=this.getNeighbor(pos,fg)
		let thisConnection=this.connections[this.mod(pos)][0]
		let otherConnection=null
		if (other!=null){
			otherConnection=other.connections[other.mod(this.opposite(pos))][0]
		}
		if (thisConnection==1 && (otherConnection==2 || alwaystrue==1)){
			return true
		}

		if (thisConnection==2 && (otherConnection==1 || alwaystrue==2)){
			return true
		}
		return false
	}

	getBinaryInputState(){
		let state="0000"
		for (let pos=0;pos<4;pos++){
			let other=this.getNeighbor(pos)
			if (other!=null){
				if (this.connections[this.mod(pos)][0]==1 && other.connections[other.mod(this.opposite(pos))][0]==2 && other.state[other.mod(this.opposite(pos))]==1){
					let i=map(this.connections[this.mod(pos)][1],0,3,3,0)
					state=state.substring(0,i)+1+state.substring(i+1,4)
				}
			}
		}
		return parseInt(state,2)
	}

	getConnections(s,o){
		let res=[]
		for (let pos=0;pos<4;pos++){
			let other=this.getNeighbor(pos);
			if (other){
				if (this.connections[this.mod(pos)][0]==s && other.connections[other.mod(this.opposite(pos))][0]==o){
					res.push(other)
				}
			}
		}
		return res
	}

	opposite(pos){
		if (pos==0)return 2
		if (pos==2)return 0
		if (pos==1)return 3
		if (pos==3)return 1
	}

	changeConnection(pos){
		let realpos=this.mod(pos)

		if (this.connections[realpos][0]==2){
			this.connections[realpos]=[0,0]
		}else{
			this.connections[realpos][0]++
		}
		print(this.connections[realpos])
	}
}