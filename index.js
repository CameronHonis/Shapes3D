let screenWidth;
let screenHeight;
let radiusMult = 150
let shapeRotation = [[1,0,0],[0,1,0],[0,0,1]]
let dots = []
const meshes = {
    sphere: [],
    cube: [
        [[.57,.57,.57],[-.57,.57,.57],[.57,.57,-.57]],//top
        [[-.57,.57,-.57],[-.57,.57,.57],[.57,.57,-.57]],
        [[.57,-.57,.57],[-.57,-.57,.57],[.57,-.57,-.57]],//bottom
        [[-.57,-.57,-.57],[.57,-.57,-.57],[-.57,-.57,.57]],
        [[.57,.57,.57],[.57,.57,-.57],[.57,-.57,.57]], //rel right
        [[.57,-.57,-.57],[.57,-.57,.57],[.57,.57,-.57]],
        [[-.57,.57,.57],[-.57,-.57,.57],[-.57,.57,-.57]],//rel left
        [[-.57,-.57,-.57],[-.57,.57,-.57],[-.57,-.57,.57]],
        [[.57,.57,.57],[-.57,.57,.57],[.57,-.57,.57]],//front
        [[-.57,-.57,.57],[.57,-.57,.57],[-.57,.57,.57]],
        [[.57,.57,-.57],[-.57,.57,-.57],[.57,-.57,-.57]],//back
        [[-.57,-.57,-.57],[.57,-.57,-.57],[-.57,.57,-.57]]
    ],
    pyramid: [
        [[1,.1,1],[-1,.1,1],[1,.1,-1]],
        [[-1,.1,-1],[1,.1,-1],[-1,.1,1]],
        //[[.57,-.57,.57],[-.57,-.57,.57],[.57,-.57,-.57]],//bottom
        //[[-.57,-.57,-.57],[.57,-.57,-.57],[-.57,-.57,.57]],
        //[[.57,-.57,.57],[-.57,-.57,.57],[.57,1.2,-.57]],
        //[[-.57,1.2,-.57],[.57,1.2,-.57],[.57,-.57,.57]]
        //[[.57,-.57,.57],[.57,-.57,-.57],[0,.57,0]]
        [[.57,-.57,.57],[.57,-.57,0],[0,.57,0]],//right
        [[.57,-.57,-.57],[.57,-.57,0],[0,.57,0]],
        [[-.57,-.57,.57],[-.57,-.57,0],[0,.57,0]],//left
        [[-.57,-.57,-.57],[-.57,-.57,0],[0,.57,0]],
        [[.57,-.57,.57],[0,-.57,.57],[0,.57,0]],//front
        [[-.57,-.57,.57],[0,-.57,.57],[0,.57,0]],
        [[.57,-.57,-.57],[0,-.57,-.57],[0,.57,0]],//back
        [[-.57,-.57,-.57],[0,-.57,-.57],[0,.57,0]],
    ],
}
function calculateWindowSize(){
    screenWidth = Math.max(
        document.body.scrollWidth,
        document.documentElement.scrollWidth,
        document.body.offsetWidth,
        document.documentElement.offsetWidth,
        document.documentElement.clientWidth
    );
    
    screenHeight = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.offsetHeight,
        document.documentElement.clientHeight
    );
}
calculateWindowSize()
window.onresize = calculateWindowSize
function LineLineIntersection(line1,line2){ //lines are arrays. first index = origin, second = slope

}
function DeepCopy(obj){
    if (obj === null || typeof obj !== 'object'){
        return obj
    }
    let returnObj = Array.isArray(obj) ? [] : {}
    for (let i in obj){
        returnObj[i] = DeepCopy(obj[i])
    }
    return returnObj
}
let resetTime
function ResetDots(shapeData){
    //shapeData is an array of triangles* that signifies the faces of the shape
    //*triangles are arrays of 3 vector R3s describing the triangles vertices
    //if no shapeData is provided, shape is assumed to be a sphere
    dots.forEach(v => v[1].remove())
    dots = []
    viewState = 'transistion'
    gsap.fromTo('#shadow',{opacity: 0},{duration: 5,opacity: .35})
    setTimeout(() => {
        viewState = 'live'
    },5000)
    resetTime = Date.now()/1000
    for (let i = 0; i < 200; i++){
        const dot = document.createElement('div')
        document.body.appendChild(dot)
        dot.style.position = 'absolute'
        dot.style.left = screenWidth*Math.random()+'px'
        dot.style.top = screenHeight*Math.random()+'px'
        dot.style.pointerEvents = 'none'
        dot.draggable = false
        const theta = Math.random()*Math.PI*2 //x-axis rot
        const phi = Math.random()*Math.PI*2 //rel (from x-axis rot) z-axis rot
        const thetaVector = [Math.cos(theta),0,-Math.sin(theta)]
        const relZAxis = [Math.cos(theta-Math.PI/2),0,-Math.sin(theta-Math.PI/2)]
        const ray = Rodrigues(thetaVector,relZAxis,phi)
        let closestInt = 1
        if (shapeData){
            shapeData.forEach(tri => {
                const intReturn = LineTriangleIntersection([0,0,0],ray,tri)
                if (intReturn && intReturn[1] < closestInt){
                    closestInt = intReturn[1]
                }
            })
        }
        dots.push([[closestInt*ray[0],closestInt*ray[1],closestInt*ray[2]],dot])
    }
}

function LineTriangleIntersection(vectorStart,vectorEnd,triangle){
    const triangle01 = [triangle[1][0]-triangle[0][0],triangle[1][1]-triangle[0][1],triangle[1][2]-triangle[0][2]]
    const triangle02 = [triangle[2][0]-triangle[0][0],triangle[2][1]-triangle[0][1],triangle[2][2]-triangle[0][2]]
    const planeNormal = UnitVector(CrossR3(triangle01,triangle02))
    const triangle0RayOrigin = [triangle[0][0]-vectorStart[0],triangle[0][1]-vectorStart[1],triangle[0][2]-vectorStart[2]]
    const rayMag = Magnitude([vectorEnd[0]-vectorStart[0],vectorEnd[1]-vectorStart[1],vectorEnd[2]-vectorStart[2]])
    const rayDir = UnitVector([vectorEnd[0]-vectorStart[0],vectorEnd[1]-vectorStart[1],vectorEnd[2]-vectorStart[2]])
    const intRayMag = Math.abs(Dot(triangle0RayOrigin,planeNormal)/Dot(rayDir,planeNormal))
    if (intRayMag > rayMag){
        //ray ends before intersection
        return false
    }
    const intVector = [vectorStart[0]+intRayMag*rayDir[0],vectorStart[1]+intRayMag*rayDir[1],vectorStart[2]+intRayMag*rayDir[2]]
    const triangle0IntVector = [intVector[0]-triangle[0][0],intVector[1]-triangle[0][1],intVector[2]-triangle[0][2]]
    const cross1 = CrossR3(triangle0IntVector,triangle01)
    const cross2 = CrossR3(triangle0IntVector,triangle02)
    if (cross1[0] === 0 && cross1[1] === 0 && cross1[2] === 0){
        //int point is directly on line triangle01
    } else if (cross2[0] === 0 && cross2[1] === 0 && cross2[2] === 0){
        //int point is directly on line triangle02
    } else if (Math.sign(cross1[0]) === Math.sign(cross2[0]) || Math.sign(cross1[1]) === Math.sign(cross2[1]) || Math.sign(cross1[2]) === Math.sign(cross2[2])){
        //int point is outside of triangle bounds on plane
        return false
    }
    /*} else if (Math.abs(cross1[0] + cross2[0]) > .001 || Math.abs(cross1[1] + cross2[1]) > .001 || Math.abs(cross1[2] + cross2[2]) > .001){
        //int point is outside of triangle bounds on plane
        console.log('a')
        return false
    }*/
    const triangle12Unit = UnitVector([triangle[2][0]-triangle[1][0],triangle[2][1]-triangle[1][1],triangle[2][2]-triangle[1][2]])
    const triangle0IntUnit = UnitVector(triangle0IntVector)
    //system of equations code VVVVVVVV
    const slopeXYMatrix = InverseMatrix([[triangle0IntUnit[0],-triangle12Unit[0]],[triangle0IntUnit[1],-triangle12Unit[1]]])
    const slopeXZMatrix = InverseMatrix([[triangle0IntUnit[0],-triangle12Unit[0]],[triangle0IntUnit[2],-triangle12Unit[2]]])
    const slopeYZMatrix = InverseMatrix([[triangle0IntUnit[1],-triangle12Unit[1]],[triangle0IntUnit[2],-triangle12Unit[2]]])
    const invMatrix = slopeXYMatrix || slopeXZMatrix || slopeYZMatrix
    const offsetsMatrix = [[triangle[1][0]-triangle[0][0]],[triangle[1][1]-triangle[0][1]]]
    const alphaBeta = InvertMatrix(CrossMatrix(invMatrix,offsetsMatrix))
    const linesInt = [triangle[0][0]+alphaBeta[0]*triangle0IntUnit[0],triangle[0][1]+alphaBeta[0]*triangle0IntUnit[1],triangle[0][2]+alphaBeta[0]*triangle0IntUnit[2]]
    const linesIntDis = Magnitude([linesInt[0]-triangle[0][0],linesInt[1]-triangle[0][1],linesInt[2]-triangle[0][2]])
    const triangle0IntDis = Magnitude(triangle0IntVector)
    if (linesIntDis < triangle0IntDis){
        //edge case where int pos isnt within third line furthest from triangle0
        return false
    }
    return [intVector,Magnitude([intVector[0]-vectorStart[0],intVector[1]-vectorStart[1],intVector[2]-vectorStart[2]])]
}
function InverseMatrix(matrix){ //returns the actual inverse of the matrix given or undefined if no possible solution
    if (matrix.length === 2 && matrix[0].length === 2){
        const det = matrix[0][0]*matrix[1][1] - matrix[1][0]*matrix[0][1]
        if (det === 0){
            return
        }
        return [[matrix[1][1]/det,-matrix[0][1]/det],[-matrix[0][0]/det,matrix[1][0]/det]]
    }
    let minorsMatrix = []
    for (let r = 0; r < matrix.length; r++){
        minorsMatrix[r] = []
        for (let c = 0; c < matrix[0].length; c++){
            let matrixClone = DeepCopy(matrix)
            matrixClone.splice(r,1)
            matrixClone.forEach((v,i) => matrixClone[i].splice(c,1))
            minorsMatrix[r][c] = Math.pow(-1,(r+c)%2)*Determinant(matrixClone)
        }
    }
    minorsMatrix = InvertMatrix(minorsMatrix)
    let determinant = 0
    minorsMatrix.forEach((v,i) => determinant += matrix[0][i]*v[0])
    if (determinant === 0){
        return
    }
    minorsMatrix.forEach((v,i) => {
        v.forEach((vv,ii) => minorsMatrix[i][ii] = vv/determinant)
    })
    return minorsMatrix
}
function InvertMatrix(matrix){ //returns a matrix in column-row form from row-column form
    const returnMatrix = []
    for (let c = 0; c < matrix[0].length; c++){
        const colVector = [];
        for (let r = 0; r < matrix.length; r++){
            colVector.push(matrix[r][c])
        }
        returnMatrix.push(colVector)
    }
    return returnMatrix
}
function UnitVector(vector){
    let sqTotal = 0
    for (let i = 0; i < vector.length; i++){
        sqTotal += Math.pow(vector[i],2)
    }
    const mag = Math.pow(sqTotal,.5)
    return vector.map(v => 1/mag*v)
}
function Magnitude(vector){
    let sqTotal = 0
    for (let i = 0; i < vector.length; i++){
        sqTotal += Math.pow(vector[i],2)
    }
    return Math.pow(sqTotal,.5)
}
function Dot(vector1,vector2){
    if (vector1.length !== vector2.length){
        console.warn('Tried taking the dot product of two vectors of different sizes')
    }
    let total = 0
    for (let i = 0; i < vector1.length; i++){
        total += vector1[i]*vector2[i]
    }
    return total
}
function CrossR3(vector1,vector2){
    if (vector1.length !== vector2.length || vector1.length !== 3){
        console.warn('One or both vectors passed does not have a length of 3')
    }
    return [
        vector1[1]*vector2[2]-vector1[2]*vector2[1],
        vector1[2]*vector2[0]-vector1[0]*vector2[2],
        vector1[0]*vector2[1]-vector1[1]*vector2[0]
    ]
}
function Determinant(matrix){
    if (matrix.length !== matrix[0].length){
        console.warn('matrix passed has different amount of rows than columns')
    }
    if (matrix.length === 2){
        return matrix[0][0]*matrix[1][1] - matrix[0][1]*matrix[1][0]
    }
    let total = 0
    for (let c = 0; c < matrix.length; c++){
        let matrixClone = DeepCopy(matrix)
        matrixClone.shift()
        matrixClone.forEach((v,i) => v.splice(c,1))
        total += Math.pow(-1,c%2)*matrix[0][c]*Determinant(matrixClone)
    }
    return total
}
function CrossMatrix(matrix1,matrix2){
    if (matrix1[0].length !== matrix2.length){
        console.warn('Tried crossing incompatible matrices of size ['+matrix1.length+','+matrix1[0].length+'] and ['+matrix2.length+','+matrix2[0].length+']')
    }
    const rMatrix = []
    matrix1.forEach(v => rMatrix.push([]))
    const matrix2Formatted = InvertMatrix(matrix2) //converted matrix from row-column form to column-row form (helps simplify next step)
    for (let r = 0; r < matrix1.length; r++){
        for (let c = 0; c < matrix2Formatted.length; c++){
            rMatrix[r][c] = Dot(matrix1[r],matrix2Formatted[c])
        }
    }
    return rMatrix
}
function Rodrigues(targetVector,axisVector,theta){
    theta *= -1
    const part1 = targetVector.map(v => v*Math.cos(theta))
    const part2 = CrossR3(axisVector,targetVector).map(v => v*Math.sin(theta))
    const part3 = axisVector.map(v => v*Dot(axisVector,targetVector)*(1-Math.cos(theta)))
    return [
        part1[0]+part2[0]+part3[0],
        part1[1]+part2[1]+part3[1],
        part1[2]+part2[2]+part3[2]
    ]
}
function EulerAnglesToMatrix(anglesVector){ //works in ZYX order
    let returnMatrix = [[1,0,0],[0,1,0],[0,0,1]]
    returnMatrix = [
        Rodrigues(returnMatrix[0],returnMatrix[2],anglesVector[2]),
        Rodrigues(returnMatrix[1],returnMatrix[2],anglesVector[2]),
        returnMatrix[2]
    ]
    returnMatrix = [
        Rodrigues(returnMatrix[0],returnMatrix[1],anglesVector[1]),
        returnMatrix[1],
        Rodrigues(returnMatrix[2],returnMatrix[1],anglesVector[1])
    ]
    returnMatrix = [
        returnMatrix[0],
        Rodrigues(returnMatrix[1],returnMatrix[0],anglesVector[0]),
        Rodrigues(returnMatrix[2],returnMatrix[0],anglesVector[0])
    ]
    return returnMatrix
}

let viewState = 'intro'
let maxDotSize = 6
function PositionDots(rotation){
    shapeRotation = CrossMatrix(EulerAnglesToMatrix([rotation[0]*Math.PI/180,rotation[1]*Math.PI/180,0]),shapeRotation)
    dots.forEach(v => {
        const dotDir = CrossMatrix(shapeRotation,[[v[0][0]],[v[0][1]],[v[0][2]]])
        const dotPos = dotDir.map(vv => vv*radiusMult)
        if (viewState === 'transistion'){
            gsap.to(v[1],{
                duration: Math.min(1/(Date.now()/1000-resetTime),4.9),
                left: String(dotPos[0]+screenWidth/2) + 'px',
                top: String(-dotPos[1]+screenHeight/2 - .05*screenHeight*Math.sin(yOffsetTime) - .05*screenHeight) + 'px'
            })
        } else {
            v[1].style.left = String(dotPos[0]+screenWidth/2) + 'px'
            v[1].style.top = String(-dotPos[1]+screenHeight/2 - .05*screenHeight*Math.sin(yOffsetTime) - .05*screenHeight) + 'px' 
        }
        let dotSize = (dotPos[2]+radiusMult)/(2*radiusMult)*maxDotSize/2 + maxDotSize/2
        v[1].style.width = String(dotSize)+'px'
        v[1].style.height = String(dotSize)+'px'
    })
    document.querySelector('#shadow').style.width = String(300*radiusMult/screenWidth - 70*radiusMult/screenWidth*Math.sin(yOffsetTime)) + 'vw'
    document.querySelector('#shadow').style.height = String(150*radiusMult/screenWidth - 35*radiusMult/screenWidth*Math.sin(yOffsetTime)) + 'vw'
    document.querySelector('#shadow').style.top = String(70 + 30*2*radiusMult/screenHeight) + '%'
}
setTimeout(() => {
    ResetDots([])
},2000)
setTimeout(() => {
    LoopAnnotations(0)
},7000)
let rotSpeed = [0,0]
let targetRotSpeed = [36,36]
let correctionAccel = 500
let yOffsetTime = 0
let timeInterval = 25 //interval period in ms
setInterval(() => {
    if (!mouseDown[0] || colorButtonDown || viewState === 'transistion' && viewState !== 'intro'){
        if (Math.abs(rotSpeed[0]-targetRotSpeed[0]) <= correctionAccel*timeInterval/1000){
            rotSpeed[0] = targetRotSpeed[0]
        } else {
            rotSpeed[0] += Math.sign(targetRotSpeed[0]-rotSpeed[0])*correctionAccel*timeInterval/1000
        }
        if (Math.abs(rotSpeed[1]-targetRotSpeed[1]) <= correctionAccel*timeInterval/1000){
            rotSpeed[1] = targetRotSpeed[1]
        } else {
            rotSpeed[1] += Math.sign(targetRotSpeed[1]-rotSpeed[1])*correctionAccel*timeInterval/1000
        }
        yOffsetTime += timeInterval/1000
        const rotMag = Magnitude(rotSpeed)
        if (rotMag > 1000) {
            rotSpeed = rotSpeed.map(v => 1000/rotMag*v)
        }
        PositionDots(rotSpeed.map(v => timeInterval*v/1000))
    }
},timeInterval)
let mouseDown = [false,false,false]
document.querySelector('.container').addEventListener('mousedown',(e) => {
    mouseDown[e.button] = true
})
const annotations = [
    'Left click drag to rotate shape',
    'Right click drag to resize shape'
]
function LoopAnnotations(annotationIndex){
    setTimeout(() => {
        document.querySelector('#annotation').textContent = annotations[annotationIndex]
        gsap.to('#annotation',{duration: 1, color: 'rgb(255,255,255,1)'})
    },1000)
    setTimeout(() => {
        gsap.to('#annotation',{duration: 1, color: 'rgb(255,255,255,0)'})
    },5000)
    setTimeout(() => {
        annotationIndex++
        if (annotationIndex > annotations.length - 1){
            annotationIndex = 0
        }
        LoopAnnotations(annotationIndex)
    },8000)
}

function mouseUp(e){
    mouseDown[e.button] = false
    lastTime = null
    if (!mouseDown[0] && colorButtonDown){
        e.stopImmediatePropagation()
        colorButtonDown = false
        document.querySelector('#colorButton').style.cursor = 'auto'
        document.querySelector('#colorSlider').style.cursor = 'auto'
        document.querySelector('.container').style.cursor = 'auto'
    }
}
document.querySelector('.container').addEventListener('mouseup',mouseUp)
document.querySelector('#colorButton').addEventListener('mouseup',mouseUp)

let mousePos = []
let lastTime;
function mouseMoved(e){
    if (e.clientX <= 0 || e.clientX >= screenWidth || e.clientY <= 0 || e.clientY >= screenHeight-10){
        mouseDown = [false,false,false]
    }
    if (e.clientY/screenHeight < .8){
        if (!document.querySelector('#colorButton').className.includes('hidden') && !colorButtonDown){
            document.querySelector('#colorButton').classList.add('hidden')
            document.querySelector('#colorSlider').classList.add('hidden')
            gsap.fromTo('#colorButton',{opacity: 1,top: '95%'},{opacity: .5,top: '110%', duration: .33})
            gsap.fromTo('#colorSlider',{opacity: 1,top: '95%'},{opacity: 0,top: '110%', duration: .33})
        }
    } else if (!mouseDown[0]) {
        if (document.querySelector('#colorButton').className.includes('hidden')){
            document.querySelector('#colorButton').classList.remove('hidden')
            document.querySelector('#colorSlider').classList.remove('hidden')
            gsap.fromTo('#colorButton',{opacity: .5,top: '110%'},{opacity: 1,top: '95%', duration: .33})
            gsap.fromTo('#colorSlider',{opacity: 0,top: '110%'},{opacity: 1,top: '95%', duration: .33})
        }
    }
    if (e.clientX/screenWidth < .8){
        if (!document.querySelector('#shapes').className.includes('hidden')){
            document.querySelector('#shapes').classList.add('hidden')
            gsap.fromTo('#sphere',{right: '4%'},{duration: .33, right: '-70px'})
            gsap.fromTo('#cube',{right: '4%'},{duration: .33, right: '-70px'})
        }
    } else if (!mouseDown[0] && viewState === 'live') {
        if (document.querySelector('#shapes').className.includes('hidden')){
            document.querySelector('#shapes').classList.remove('hidden')
            gsap.fromTo('#sphere',{right: '-70px'},{duration: .33, right: '4%'})
            gsap.fromTo('#cube',{right: '-70px'},{duration: .33, right: '4%'})
        }
    }
    if (colorButtonDown){
        const button = document.querySelector('#colorButton')
        button.style.left = String(100*e.clientX/screenWidth) + '%'
        const slider = document.querySelector('#colorSlider')
        if (e.clientX < (screenWidth - (slider.offsetWidth-15))/2){
           button.style.left = String(50 - 100*(slider.offsetWidth-15)/2/screenWidth) + '%' 
        } else if (e.clientX > (screenWidth + slider.offsetWidth-15)/2){
            button.style.left = String(50 + 100*(slider.offsetWidth-15)/2/screenWidth) + '%'
        }
        const relPos = (e.clientX-(screenWidth-(slider.offsetWidth-15))/2)/slider.offsetWidth
        let color = [0,0,0]
        if (relPos < .2){
            color = [255,255*relPos/.2,0]
        } else if (relPos < .4){
            color = [255*(.4-relPos)/.2,255,0]
        } else if (relPos < .6){
            color = [0,255,255*(relPos-.4)/.2]
        } else if (relPos < .8){
            color = [0,255*(.8-relPos)/.2,255]
        } else {
            color = [255*(relPos-.8)/.2,0,255]
        }
        document.querySelectorAll('div').forEach((v) => {
            if (v.className === '' && v.id === ''){
                v.style['background-color'] = `rgb(${color[0]},${color[1]},${color[2]})`
            }
        })
    } else if (mouseDown[0] && viewState === 'live'){
        const t = Date.now()/1000
        if (!lastTime){
            lastTime = t
        }
        const dt = t - lastTime
        lastTime = t
        let mouseDiff = [mousePos[0]-e.clientX,mousePos[1]-e.clientY]
        rotSpeed = [-10*mouseDiff[1],-10*mouseDiff[0]]
        PositionDots(rotSpeed.map(v => dt*v))
    } else if (mouseDown[2] && viewState === 'live'){
        let mouseDiff = [mousePos[0]-e.clientX,mousePos[1]-e.clientY]
        let centerMouseVector = [screenWidth/2-e.clientX,screenHeight/2-e.clientY]
        radiusMult += Dot(mouseDiff,UnitVector(centerMouseVector))/4
    }
    mousePos = [e.clientX,e.clientY]
}
document.querySelector('.container').addEventListener('mousemove',mouseMoved)
document.querySelector('#colorButton').addEventListener('mousemove',mouseMoved)
//document.querySelector('#overlay').addEventListener('mousemove',mouseMoved)

let colorButtonDown = false; //false or xPos of where it was first down
document.querySelector('#colorButton').addEventListener('mousedown',(e) => {
    e.stopImmediatePropagation()
    colorButtonDown = e.clientX
})

function shapesClick(e){
    if (viewState === 'live' && !e.target.className.baseVal.includes('selected')){
        document.querySelector('#shapes').childNodes.forEach(v => v.classList && v.classList.remove('selected'))
        e.target.classList.add('selected')
        document.querySelector('#shapes').classList.add('hidden')
        gsap.fromTo('#sphere',{right: '4%'},{duration: .33, right: '-70px'})
        gsap.fromTo('#cube',{right: '4%'},{duration: .33, right: '-70px'})
        ResetDots(meshes[e.target.id])
    }
}
document.querySelector('#sphere').addEventListener('click', shapesClick)
document.querySelector('#cube').addEventListener('click', shapesClick)

document.querySelector('#sphere').addEventListener('mouseover', e => {
    if (!document.querySelector('#sphere').className.includes('selected')){
        document.querySelector('#selector').style.top = 'calc(20% + 25px)'
        document.querySelector('#selector').style.right = '-2%'
    }
    
})
document.querySelector('#cube').addEventListener('mouseover', e => {
    if (!document.querySelector('#cube').className.includes('selected')){
        document.querySelector('#selector').style.top = 'calc(30% + 25px)'
        ocument.querySelector('#selector').style.right = '-2%'
    }
})

function shapesOut(){
    document.querySelector('#selector').style.right = '-10%'
}
document.querySelector('#sphere').addEventListener('mouseout', shapesOut)
document.querySelector('#cube').addEventListener('mouseout', shapesOut)

// add/remove dots button w text box
// annotations
// right click drag resizes sphere
// middle click drag changes target velo
// 4 half opaque dots showing start/end path of middle + right click drags