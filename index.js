let screenWidth;
let screenHeight;
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
let sphere = []
let sphereRot = [0,0]
let sphereCenter = [screenWidth/2,screenHeight/2]
let sphereRadius = 150
let dots = []
const rot = [0,0]
let center = [screenWidth/2,screenHeight/2]
let radiusMult = 150
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
function ResetDots(shapeData){
    //shapeData is an array of triangles* that signifies the faces of the shape
    //*triangles are arrays of 3 vector R3s describing the triangles vertices
    //if no shapeData is provided, shape is assumed to be a sphere
    dots.forEach(v => v[1].remove())
    dots = []
    for (let i = 0; i < 700; i++){
        const dot = document.createElement('div')
        document.body.appendChild(dot)
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
//ResetDots() //circle
ResetDots([ //square
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
])
/*ResetDots([
    [[1,.1,1],[-1,.1,1],[1,.1,-1]],
    [[-1,.1,-1],[1,.1,-1],[-1,.1,1]],
    //[[.57,-.57,.57],[-.57,-.57,.57],[.57,-.57,-.57]],//bottom
    //[[-.57,-.57,-.57],[.57,-.57,-.57],[-.57,-.57,.57]],
    //[[.57,-.57,.57],[-.57,-.57,.57],[.57,1.2,-.57]],
    //[[-.57,1.2,-.57],[.57,1.2,-.57],[.57,-.57,.57]]
    //[[.57,-.57,.57],[.57,-.57,-.57],[0,.57,0]]
    /*[[.57,-.57,.57],[.57,-.57,0],[0,.57,0]],//right
    [[.57,-.57,-.57],[.57,-.57,0],[0,.57,0]],
    [[-.57,-.57,.57],[-.57,-.57,0],[0,.57,0]],//left
    [[-.57,-.57,-.57],[-.57,-.57,0],[0,.57,0]],
    [[.57,-.57,.57],[0,-.57,.57],[0,.57,0]],//front
    [[-.57,-.57,.57],[0,-.57,.57],[0,.57,0]],
    [[.57,-.57,-.57],[0,-.57,-.57],[0,.57,0]],//back
    [[-.57,-.57,-.57],[0,-.57,-.57],[0,.57,0]],
])*/
/*for (let i = 0; i < 200; i++){
    let dot = document.createElement('div')
    document.body.appendChild(dot)
    sphere.push([
        Math.floor(361*Math.random()),
        Math.floor(361*Math.random()),
        dot
    ])
}*/
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
    returnMatrix = []
    for (let c = 0; c < matrix[0].length; c++){
        colVector = [];
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
    const part1 = targetVector.map(v => v*Math.cos(theta))
    const part2 = CrossR3(axisVector,targetVector).map(v => v*Math.sin(theta))
    const part3 = axisVector.map(v => v*Dot(axisVector,targetVector)*(1-Math.cos(theta)))
    return [
        part1[0]+part2[0]+part3[0],
        part1[1]+part2[1]+part3[1],
        part1[2]+part2[2]+part3[2]
    ]
}
let maxDotSize = 6
function PositionDots(){
    let relXRot = sphereRot[0]
    let relYRot = sphereRot[1]
    while (relXRot >= 360){
        relXRot -= 360
    }
    while (relXRot < 0){
        relXRot += 360
    }
    while (relYRot >= 360){
        relYRot -= 360
    }
    while (relYRot < 0){
        relYRot += 360
    }
    const xyAxis = UnitVector([relXRot,-relYRot,0])
    const xyMag = .707*Magnitude([relXRot,relYRot])
    const lookVector = Rodrigues([0,0,1],xyAxis,xyMag*Math.PI/180)
    const upVector = Rodrigues([0,1,0],xyAxis,xyMag*Math.PI/180)
    const rightVector = Rodrigues([1,0,0],xyAxis,xyMag*Math.PI/180)
    const shapeCF = [rightVector,upVector,lookVector]
    dots.forEach(v => {
        const dotDir = CrossMatrix(shapeCF,[[v[0][0]],[v[0][1]],[v[0][2]]])
        const dotPos = dotDir.map(vv => vv*radiusMult)
        v[1].style.left = String(dotPos[0]+screenWidth/2) + 'px'
        v[1].style.top = String(-dotPos[1]+screenHeight/2) + 'px'
        let dotSize = (dotPos[2]+radiusMult)/(2*radiusMult)*maxDotSize/2 + maxDotSize/2
        v[1].style.width = String(dotSize)+'px'
        v[1].style.height = String(dotSize)+'px'
    })
}
let rotSpeed = [0,0]
let targetRotSpeed = [36,36]
let correctionAccel = 500
let lastRenderedMousePos = null
let timeInterval = .025 //inverse of render framerate
setInterval(() => {
    if (!mouseDown){
        if (Math.abs(rotSpeed[0]-targetRotSpeed[0]) <= correctionAccel*timeInterval){
            rotSpeed[0] = targetRotSpeed[0]
        } else {
            rotSpeed[0] += Math.sign(targetRotSpeed[0]-rotSpeed[0])*correctionAccel*timeInterval
        }
        if (Math.abs(rotSpeed[1]-targetRotSpeed[1]) <= correctionAccel*timeInterval){
            rotSpeed[1] = targetRotSpeed[1]
        } else {
            rotSpeed[1] += Math.sign(targetRotSpeed[1]-rotSpeed[1])*correctionAccel*timeInterval
        }
        sphereRot[0] += rotSpeed[0]*timeInterval
        sphereRot[1] += rotSpeed[1]*timeInterval
    } else { //mouse down
        sphereRot[1] = sphereRotDownLock[1] - .2*(mousePos[0] - mouseDown[0])
        //sphereRot[0] = sphereRotDownLock[0] - .2*(mousePos[1] - mouseDown[1])
        if (lastRenderedMousePos){
            rotSpeed = [(lastRenderedMousePos[1]-mousePos[1])/timeInterval*.2,
            (lastRenderedMousePos[0]-mousePos[0])/timeInterval*.2]
        }
        lastRenderedMousePos = mousePos
    }
    //console.log(rotSpeed[0]+','+rotSpeed[1])
    PositionDots()
},timeInterval*1000)
let mouseDown = false //is an array of xPos,yPos of where mouse was first down
let sphereRotDownLock; //an array of the rot of the sphere when mouse was first down
document.querySelector('.container').addEventListener('mousedown',(e) => {
    mouseDown = [e.clientX,e.ClientY]
    sphereRotDownLock = [...sphereRot]
})

let mousePos = []
function mouseUp(e){
    if (mouseDown){
        mouseDown = false
    } else if (colorButtonDown) {
        e.stopImmediatePropagation()
        colorButtonDown = false
        document.querySelector('#colorButton').style.cursor = 'auto'
        document.querySelector('#colorSlider').style.cursor = 'auto'
        document.querySelector('.container').style.cursor = 'auto'
        //document.querySelector('#overlay').style.cursor = 'auto'
    }
}
document.querySelector('.container').addEventListener('mouseup',mouseUp)
document.querySelector('img').addEventListener('mouseup',mouseUp)
document.querySelector('#colorButton').addEventListener('mouseup',mouseUp)
document.querySelector('#colorSlider').addEventListener('mouseup',mouseUp)
//document.querySelector('#overlay').addEventListener('mousemove',mouseMoved)

function mouseMoved(e){
    mousePos = [e.clientX,e.clientY]
    if (e.clientY/screenHeight < .8){
        if (!document.querySelector('#colorButton').className.includes('hidden') && !colorButtonDown){
            document.querySelector('#colorButton').classList.add('hidden')
            document.querySelector('#colorSlider').classList.add('hidden')
            gsap.fromTo('#colorButton',{opacity: 1,top: '95%'},{opacity: .5,top: '110%', duration: .33})
            gsap.fromTo('#colorSlider',{opacity: 1,top: '95%'},{opacity: 0,top: '110%', duration: .33})
        }
        
    } else {
        if (document.querySelector('#colorButton').className.includes('hidden')){
            document.querySelector('#colorButton').classList.remove('hidden')
            document.querySelector('#colorSlider').classList.remove('hidden')
            gsap.fromTo('#colorButton',{opacity: .5,top: '110%'},{opacity: 1,top: '95%', duration: .33})
            gsap.fromTo('#colorSlider',{opacity: 0,top: '110%'},{opacity: 1,top: '95%', duration: .33})
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
    }
}
document.querySelector('.container').addEventListener('mousemove',mouseMoved)
document.querySelector('img').addEventListener('mousemove',mouseMoved)
document.querySelector('#colorButton').addEventListener('mousemove',mouseMoved)
document.querySelector('#colorSlider').addEventListener('mousemove',mouseMoved)
//document.querySelector('#overlay').addEventListener('mousemove',mouseMoved)

let colorButtonDown = false; //false or xPos of where it was first down
document.querySelector('#colorButton').addEventListener('mousedown',(e) => {
    e.stopImmediatePropagation()
    colorButtonDown = e.clientX
})

// add/remove dots button w text box
// color slider
// annotations
// right click drag resizes sphere