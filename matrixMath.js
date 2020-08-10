export function LineTriangleIntersection(vectorStart,vectorEnd,triangle){
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
export function InverseMatrix(matrix){ //returns the actual inverse of the matrix given or undefined if no possible solution
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
export function InvertMatrix(matrix){ //returns a matrix in column-row form from row-column form
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
export function UnitVector(vector){
    let sqTotal = 0
    for (let i = 0; i < vector.length; i++){
        sqTotal += Math.pow(vector[i],2)
    }
    const mag = Math.pow(sqTotal,.5)
    return vector.map(v => 1/mag*v)
}
export function Magnitude(vector){
    let sqTotal = 0
    for (let i = 0; i < vector.length; i++){
        sqTotal += Math.pow(vector[i],2)
    }
    return Math.pow(sqTotal,.5)
}
export function Dot(vector1,vector2){
    if (vector1.length !== vector2.length){
        console.warn('Tried taking the dot product of two vectors of different sizes')
    }
    let total = 0
    for (let i = 0; i < vector1.length; i++){
        total += vector1[i]*vector2[i]
    }
    return total
}
export function CrossR3(vector1,vector2){
    if (vector1.length !== vector2.length || vector1.length !== 3){
        console.warn('One or both vectors passed does not have a length of 3')
    }
    return [
        vector1[1]*vector2[2]-vector1[2]*vector2[1],
        vector1[2]*vector2[0]-vector1[0]*vector2[2],
        vector1[0]*vector2[1]-vector1[1]*vector2[0]
    ]
}
export function Determinant(matrix){
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
export function CrossMatrix(matrix1,matrix2){
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
export function Rodrigues(targetVector,axisVector,theta){
    const part1 = targetVector.map(v => v*Math.cos(theta))
    const part2 = CrossR3(axisVector,targetVector).map(v => v*Math.sin(theta))
    const part3 = axisVector.map(v => v*Dot(axisVector,targetVector)*(1-Math.cos(theta)))
    return [
        part1[0]+part2[0]+part3[0],
        part1[1]+part2[1]+part3[1],
        part1[2]+part2[2]+part3[2]
    ]
}