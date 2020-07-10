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
for (let i = 0; i < 200; i++){
    let dot = document.createElement('div')
    document.body.appendChild(dot)
    sphere.push([
        Math.floor(361*Math.random()),
        Math.floor(361*Math.random()),
        dot
    ])
}
let maxDotSize = 10
function PositionSphere(){
    for (let i = 0; i < sphere.length; i++){
        sphereCenter = [screenWidth/2,.4*screenHeight]
        let totalRotX = sphere[i][0] + sphereRot[0]
        let totalRotY = sphere[i][1] + sphereRot[1]
        iPosX = sphereRadius*Math.cos(totalRotY*Math.PI/180)*Math.cos(totalRotX*Math.PI/180)
        iPosY = sphereRadius*Math.sin(totalRotX*Math.PI/180)
        iPosZ = sphereRadius*Math.sin(totalRotY*Math.PI/180)*Math.cos(totalRotX*Math.PI/180)
        //let iPosX = sphereRadius*(Math.cos(totalRotX*Math.PI/180)*Math.cos(totalRotY*Math.PI/180))
        //let iPosY = sphereRadius*(Math.sin(totalRotY*Math.PI/180)*Math.sin(totalRotX*Math.PI/180))
        sphere[i][2].style.left = String(iPosX + sphereCenter[0]) + 'px'
        sphere[i][2].style.top = String(iPosY + sphereCenter[1]) + 'px'
        let dotSize = (iPosZ+sphereRadius)/(2*sphereRadius)*maxDotSize/2 + maxDotSize/2
        sphere[i][2].style.width = String(dotSize) + 'px'
        sphere[i][2].style.height = String(dotSize) + 'px'
    }
}
let rotSpeed = [0,0]
let targetRotSpeed = [0,36]
let correctionAccel = 500
let lastRenderedMousePos = [0,0]
let timeInterval = .025
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
        sphereRot[1] += rotSpeed[1]*timeInterval
    } else {
        sphereRot[1] = sphereRotDownLock[1] - .2*(mousePos[0] - mouseDown[0])
        //console.log(`${mousePos[1]} (${typeof mousePos[1]})`)
        //console.log(`${lastRenderedMousePos[1]} (${typeof lastRenderedMousePos[1]})`)
        //console.log(`${timeInterval} (${typeof timeInterval})`)
        //console.log('------------------')
        rotSpeed = [(lastRenderedMousePos[1]-mousePos[1])/timeInterval*.2,
            (lastRenderedMousePos[0]-mousePos[0])/timeInterval*.2]
        lastRenderedMousePos = mousePos
    }
    //console.log(rotSpeed[1])
    PositionSphere()
},timeInterval*1000)
let mouseDown = false //is an array of xPos,yPos of where mouse was first down
let sphereRotDownLock; //an array of the rot of the sphere when mouse was first down
document.querySelector('.container').addEventListener('mousedown',(e) => {
    mouseDown = [e.clientX,e.ClientY]
    sphereRotDownLock = [...sphereRot]
})
document.querySelector('.container').addEventListener('mouseup',(e) => {
    mouseDown = false
})
let mousePos = []
document.querySelector('.container').addEventListener('mousemove',(e) => {
    mousePos = [e.clientX,e.clientY]
    if (e.clientY/screenHeight < .8){
        if (!document.querySelector('#colorButton').className.includes('hidden') && !colorButtonDown){
            document.querySelector('#colorButton').classList.add('hidden')
            document.querySelector('#colorSlider').classList.add('hidden')
            gsap.fromTo('#colorButton',{opacity: 1,top: '90%'},{opacity: .5,top: '110%', duration: .33})
            gsap.fromTo('#colorSlider',{opacity: 1,top: '90%'},{opacity: 0,top: '110%', duration: .33})
        }
        
    } else {
        if (document.querySelector('#colorButton').className.includes('hidden')){
            document.querySelector('#colorButton').classList.remove('hidden')
            document.querySelector('#colorSlider').classList.remove('hidden')
            gsap.fromTo('#colorButton',{opacity: .5,top: '110%'},{opacity: 1,top: '90%', duration: .33})
            gsap.fromTo('#colorSlider',{opacity: 0,top: '110%'},{opacity: 1,top: '90%', duration: .33})
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
})
let colorButtonDown = false; //false or xPos of where it was first down
document.querySelector('#colorButton').addEventListener('mousedown',(e) => {
    e.stopImmediatePropagation()
    colorButtonDown = e.clientX
})
document.querySelector('#colorButton').addEventListener('mouseup',(e) => {
    e.stopImmediatePropagation()
    colorButtonDown = false
})
// add/remove dots button w text box
// color slider
// annotations
// right click drag resizes sphere