// header формы
const inputBuildingPicker = document.querySelector('select[name="building-picker"]')
let inputFind = document.querySelector('input[name="find"]')
let buttonFind = document.querySelector('button[name="find"]')
// map-and-floorpicker
const listFloorPicker = document.querySelector('.floorpicker ol')
const divFloorMap = document.querySelector('.floor-map')
// room info
const divRoomDesc = document.querySelector('.room-desc')
const headerRoomName = divRoomDesc.querySelector('h3')
const paragraphRoomInfo = divRoomDesc.querySelector('p')
const buttonFrom = divRoomDesc.querySelector('button[name="from"]')
const buttonTo = divRoomDesc.querySelector('button[name="to"]')
// footer формы
let inputFrom = document.querySelector('input[name="from"]')
let inputWhere = document.querySelector('input[name="where"]')
let buttonRoute = document.querySelector('button[name="route"]')
// let buttonClear = document.querySelector('button[name="clear"]')

function removePrevHandlers() {
    // возможно вместо такого костыля лучше использовать атрибуты onclick для кнопки и onkeyup для инпута,
    //          but if it ain't broke - don't fix it...

    // клонируем кнопки чтобы удалить eventHandlerы от предыдущей схемы
    //                  кнопка "Найти"
    const buttonFind_new = buttonFind.cloneNode(true)
    buttonFind.parentNode.replaceChild(buttonFind_new, buttonFind)
    buttonFind = buttonFind_new
    // //                  кнопка "Поехали!"
    // const buttonRoute_new = buttonRoute.cloneNode(true)
    // buttonRoute.parentNode.replaceChild(buttonRoute_new, buttonRoute)
    // buttonRoute = buttonRoute_new
    // //                  кнопка "Очистить..."
    // const buttonClear_new = buttonClear.cloneNode(true)
    // buttonClear.parentNode.replaceChild(buttonClear_new, buttonClear)
    // buttonClear = buttonClear_new

    // то же самое для полей ввода
    //                  поле "Введите номер аудитории..."
    const inputFind_new = inputFind.cloneNode(true)
    inputFind.parentNode.replaceChild(inputFind_new, inputFind)
    inputFind = inputFind_new
    // //                  поле "Откуда..."
    // const inputFrom_new = inputFrom.cloneNode(true)
    // inputFrom.parentNode.replaceChild(inputFrom_new, inputFrom)
    // inputFrom = inputFrom_new
    // //                  поле "Куда..."
    // const inputWhere_new = inputWhere.cloneNode(true)
    // inputWhere.parentNode.replaceChild(inputWhere_new, inputWhere)
    // inputWhere = inputWhere_new
}

let prevFloor, curFloor
let prevBuilding, curBuilding

inputBuildingPicker.addEventListener("change", () => {
    // показываем выбор этажа и скрываем див с описанием помещения
    document.querySelector('.floorpicker').style.setProperty('display', 'block')
    divRoomDesc.style.setProperty('display', 'none')
    // document.querySelector('.footer-route').style.setProperty('display', 'none')

    // удаляем предыдущие обработчики событий поиска аудитории
    removePrevHandlers()
    // удаляем svg предыдущего здания
    while (divFloorMap.firstChild) {
        divFloorMap.removeChild(divFloorMap.lastChild)
    }

    // создаем новый floorPicker
    curBuilding = inputBuildingPicker.value
    createFloorPicker(curBuilding)

    // предыдущий этаж будет неопределенным, так как мы только что загрузили новый корпус
    prevFloor = undefined

    // при нажатии на кнопку этажа загружаем нужную схему
    let floorButtons = listFloorPicker.querySelectorAll('button')
    let newFloorButton
    for (let i = 0; i < floorButtons.length; i++) {
        newFloorButton = floorButtons[i]
        newFloorButton.addEventListener('click', function() {
            curFloor = this.textContent
            // проверяем условие, чтобы не загружать ту же самую схему
            if (!(curFloor === prevFloor && curBuilding === prevBuilding)) {
                // закрашиваем кнопку текущего этажа
                if (prevFloor !== undefined) {
                    floorButtons[prevFloor - 1].removeAttribute('class')
                }
                this.setAttribute('class', 'clicked')
                // скрываем див с описанием помещения
                divRoomDesc.style.setProperty('display', 'none')
                // document.querySelector('.footer-route').style.setProperty('display', 'none')

                // удаляем предыдущие обработчики событий поиска аудитории
                removePrevHandlers()
                // удаляем svg предыдущего здания
                while (divFloorMap.firstChild) {
                    divFloorMap.removeChild(divFloorMap.lastChild)
                }

                // загружаем svg нового здания
                const newSVGObject = document.createElement('object')
                newSVGObject.setAttribute('class', 'floor-svg')
                newSVGObject.setAttribute('type', 'image/svg+xml')
                const buildingSVGLocation = './svgFolder/' + curBuilding + '_' + curFloor + '.svg'
                newSVGObject.setAttribute('data', buildingSVGLocation)
                newSVGObject.setAttribute('width', '100%')
                newSVGObject.setAttribute('height', '100%')
                newSVGObject.style.setProperty('visibility', 'hidden')
                divFloorMap.appendChild(newSVGObject)

                newSVGObject.addEventListener('load', () => {
                    console.log("SVG loaded");
                    // показываем строитель маршрутов
                    // document.querySelector('.footer-route').style.setProperty('display', 'block')
                    workWithSVG()
                })
                prevFloor = curFloor
            }
        })
    }
    prevBuilding = curBuilding
})

// массив из пар здание:кол-воЭтажей
buildingTotalFloors = {
    'ГУК А': 3,
    'ГУК Б': 5,
    'ГУК В': 1
}

function createFloorPicker(curBuilding) {
    while (listFloorPicker.firstChild) {
        listFloorPicker.removeChild(listFloorPicker.lastChild)
    }
    const floorNumber = buildingTotalFloors[curBuilding]

    for (let i = 0; i < floorNumber; i++) {
        const newFloorListItem = document.createElement('li')
        listFloorPicker.appendChild(newFloorListItem)
        const newFloorButton = document.createElement('button')
        newFloorButton.textContent = (i + 1).toString()
        newFloorListItem.appendChild(newFloorButton)
    }
}

function workWithSVG() {
    // скрываем карту для обработки
    document.querySelector('.map-and-floorpicker').style.setProperty('display', 'none')

    const svgObject = document.querySelector('object.floor-svg')
    const svgDocument = svgObject.contentDocument
    const svgElement = svgDocument.querySelector('svg')
    // svgElement.style.setProperty('background-color', 'grey')
    // svgElement.style.setProperty('height', '50%')
    // svgElement.style.setProperty('width', '50%')





//                                      Работаем с помещениями
    const svgRoomsLayer = svgDocument.querySelector('svg g[*|label="rooms"]')
    // каждый элемент svgRooms - svg группа, состоящая из описания desc, условного обозначения text, геометриечской формы path и узла графа для поиска circle
    let svgRooms = Object.assign({}, svgRoomsLayer.querySelectorAll('g'))

    // const svgRoomsTemp = Object.assign({}, svgRoomsLayer.querySelectorAll('g'))
    // let svgRooms = {}
    // ключи нам походу уже не нужны... (сделал более крутой поиск)
    // // добавляем ключей для более удобного (и быстрого) поиска
    // // ключ - номер/название помещения (должны быть уникальными!)
    // for (let oldKey of Object.keys(svgRoomsTemp)) {
    //     let newKey = svgRoomsTemp[oldKey].querySelector('text tspan').textContent.toLowerCase()
    //     svgRooms[newKey] = svgRoomsTemp[oldKey]
    // }
    // delete svgRoomsTemp

    // задача 2: вывод информации о помещении
    let curRoom
    function roomClick(svgRoom) {
        if (curRoom !== undefined) {
            curRoom.querySelector('path').style.setProperty('opacity', '0')
            if (curRoom === svgRoom) {
                curRoom = undefined
                divRoomDesc.style.setProperty('display', 'none')
                return
            }
        }
        curRoom = svgRoom
        curRoom.querySelector('path').style.setProperty('opacity', '1')
        // получаем название и описание помещения
        let roomDescription = svgRoom.querySelector('desc')
        let roomName, roomInfo
        if (roomDescription !== null) {
            roomDescription = roomDescription.textContent.split('\n')
            roomName = roomDescription.shift() // возвращает первый элемент и удаляет его
            // теперь roomDescription содержит только описание помещения, без названия
            roomInfo = roomDescription.join('\n')

            headerRoomName.textContent = roomName
            paragraphRoomInfo.innerText = roomInfo
        }
        divRoomDesc.style.setProperty('display', 'block')
    }

    // предобрабатываем схему перед тем, как показать пользователю
    for (let i of Object.keys(svgRooms)) {
        svgRooms[i].style.setProperty('cursor', 'pointer')
        svgRooms[i].style.setProperty('pointer-events', 'all')

        const roomShape = svgRooms[i].querySelector('path')
        // скрываем формы помещений
        roomShape.setAttribute('style', 'fill: #0083bd; opacity: 0; transition-duration: 0.3s')

        // выделяем выбранные курсором помещения
        svgRooms[i].addEventListener('mouseenter', function() {
            if (!(curRoom === this)) {
                roomShape.style.setProperty('opacity', '0.3')
            }
        })
        svgRooms[i].addEventListener('mouseleave', function() {
            if (!(curRoom === svgRooms[i])) {
                roomShape.style.setProperty('opacity', '0')
            }
        })
        svgRooms[i].addEventListener('click', () => {roomClick(svgRooms[i])})
    }
    svgObject.style.setProperty('visibility', 'visible')
    document.querySelector('.map-and-floorpicker').style.setProperty('display', 'block')

    // изменение масштаба svg карты
    let svgScale = 1
    let minScale = 0.25
    let maxScale = 4
    function svgZoom(event) {
        event.preventDefault()

        const curX = svgElement.getBoundingClientRect().x
        const curY = svgElement.getBoundingClientRect().y
        const curWidth = svgElement.getBoundingClientRect().width
        const curHeight = svgElement.getBoundingClientRect().height

        // нужно приближаться/отдаляться к/от курсора
        svgElement.style.setProperty('transform-origin', `${event.clientX}px ${event.clientY}px`)
        // svgElement.style.setProperty('transform-origin', `${(event.clientX - curX) / curWidth * 100}% ${(event.clientY - curY) / curHeight * 100}%`)

        svgScale += -event.deltaY * 0.001
        // ограничиваем масштаб: минимум 0.25, максимум - 4
        svgScale = Math.min(Math.max(minScale, svgScale), maxScale)
        svgElement.style.setProperty('transform', `scale(${svgScale})`)
        // console.log(svgElement.getBoundingClientRect());
    }
    svgElement.addEventListener('wheel', svgZoom, {passive: false})
    // по двойному щелчку возвращаем масштаб к 1
    svgElement.addEventListener('dblclick', event => {
        event.preventDefault()
        svgScale = 1
        svgElement.style.setProperty('transform', `scale(${svgScale})`)
    })

    // перемещение карты - не работает пока что(
    // svgElement.addEventListener('mouseenter', () => {
    //     svgElement.style.setProperty('cursor', 'grab')
    // })
    //
    // let isMoving = false
    // let xBegin, yBegin
    //
    // function svgMoveStart(event) {
    //     event.preventDefault()
    //     svgElement.style.setProperty('cursor', 'grabbing')
    //     isMoving = true
    //     xBegin = event.offsetX
    //     yBegin = event.clientY
    // }
    // svgElement.addEventListener('mousedown', svgMoveStart)
    //
    // function svgMove(event) {
    //     if (isMoving) {
    //         console.log("moving");
    //         // console.log(event.offsetX - xBegin, event.offsetY - yBegin);
    //
    //         // TODO
    //         // svgElement.style.setProperty('transform-origin', `${xBegin}px ${yBegin}px`)
    //         //
    //         // // todo: сохранять масштаб!!!
    //         // svgElement.style.setProperty('transform', `translate(${event.offsetX - xBegin}px, ${event.offsetY - yBegin}px)`)
    //         //
    //         // xBegin = event.offsetX
    //         // yBegin = event.offsetY
    //     }
    // }
    // svgElement.addEventListener('mousemove', svgMove)
    //
    // function svgMoveStop() {
    //     svgElement.style.setProperty('cursor', 'grab')
    //     isMoving = false
    //     console.log("stop moving...");
    // }
    // svgElement.addEventListener('mouseup', svgMoveStop)

    // задача 1: поиск помещения
    function roomFindOrFail(foundRoom, input) {
        // если не нашли - подсвечиваем поле поиска красным
        if (foundRoom === undefined) {
            const prevBgColor = input.style.getPropertyValue('background-color')
            const prevBorderColor = input.style.getPropertyValue('border-color')

            input.style.setProperty('background-color', 'red')
            input.style.setProperty('border-color', 'white')

            setTimeout(() => {
                input.style.setProperty('background-color', prevBgColor)
                input.style.setProperty('border-color', prevBorderColor)
            }, 700)
        } else {
            // если нашли - показываем информацию о помещении и подсвечиваем его синим
            roomClick(foundRoom)
            // let roomShape = foundRoom.querySelector('path')
            // roomShape.style.setProperty('fill', '#0083bd')
            // roomShape.style.setProperty('opacity', '0.7')
            // setTimeout(() => {
            //     roomShape.style.setProperty('opacity', '0')
            // }, 700)
        }
    }

    function roomFind() {
        let neededRoomName = inputFind.value.toLowerCase()
        if (neededRoomName === '') {
            return
        }
        inputFind.value = ''

        // ищем вхождение каждого слова в название помещения
        let neededRoomNameWords = neededRoomName.split(' ')
        let foundRooms = Object.assign({}, svgRooms)
        for (let i = 0; i < neededRoomNameWords.length; i++) {
            for (let j of Object.keys(foundRooms)) {
                let curRoomName = foundRooms[j].querySelector('desc').textContent.split('\n', 1)[0].toLowerCase().split(' ')
                if (!curRoomName.includes(neededRoomNameWords[i])) {
                    delete foundRooms[j]
                }
            }
        }
        // если нашли несколько совпадений, то... (пока что отображаем все найденные помещения)
        if (Object.keys(foundRooms).length === 0) {
            roomFindOrFail(undefined, inputFind)
        } else {
            for (let i of Object.keys(foundRooms)) {
                roomFindOrFail(foundRooms[i], inputFind)
            }
        }
    }
    buttonFind.addEventListener('click', roomFind)
    inputFind.addEventListener('keyup', (event) => {
        if (event.keyCode === 13) {
            event.preventDefault()
            inputFind.blur()
            buttonFind.click()
        }
    })





//                                      Работаем с графом
    // собираем узлы из слоя с узлами graphNodes и из всех комнат из слоя rooms
    const svgNodesTemp = Object.assign({}, svgDocument.querySelectorAll('svg g[*|label="graphNodes"] *, svg g[*|label="rooms"] circle'))
    let svgNodes = {}

    // добавляем ключей для более удобного поиска (так как это NodeList, в HTMLCollection это почему-то делается автоматически...)
    for (let oldKey of Object.keys(svgNodesTemp)) {
        let newKey = svgNodesTemp[oldKey].getAttribute('id')
        svgNodes[newKey] = svgNodesTemp[oldKey]
    }
    delete svgNodesTemp

    const svgEdgesLayer = svgDocument.querySelector('svg g[*|label="graphEdges"]')
    const svgEdges = svgEdgesLayer.children

    // скрываем граф поиска
    for (let i of Object.keys(svgNodes)) {
        svgNodes[i].setAttribute('visibility', 'hidden')
    }
    for (let i = 0; i < svgEdges.length; i++) {
        svgEdges[i].setAttribute('visibility', 'hidden')
    }

    class GraphNode {
        nodeID
        neighbors = [] // массив пар вершина:расстояниеДоНее

        // для реализации поиска
        shortestPathSoFar // aka tentative distance
        cameFromNodeID

        constructor(nodeID) {
            this.nodeID = nodeID
        }

        appendNeighbor(node, distanceToNode) {
            this.neighbors.push({node, distanceToNode})
        }
    }

    // temporary для отображения номеров узлов
    // const nodeNumbersLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    // nodeNumbersLayer.setAttribute('inkscape:label', "nodeNumbers")
    // svgDocument.querySelector('svg').appendChild(nodeNumbersLayer)
    // temporary для отображения номеров узлов

    // temporary для отображения длин ребер
    // const edgeValuesLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    // edgeValuesLayer.setAttribute('inkscape:label', "edgeValues")
    // svgDocument.querySelector('svg').appendChild(edgeValuesLayer)
    // temporary для отображения длин ребер

    // создаем массив (объект) пар номер:вершина
    let graphNodes = {}
    for (let i of Object.keys(svgNodes)) {
        const sliceStart = 'path'.length
        const nodeID = svgNodes[i].getAttribute('id').slice(sliceStart)
        graphNodes[nodeID] = new GraphNode(nodeID)

        // temporary для отображения номеров узлов
        // const nodeX = parseFloat(svgNodes[i].getAttribute('cx'))
        // const nodeY = parseFloat(svgNodes[i].getAttribute('cy'))
        // const nodeNumberTextElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        // nodeNumberTextElement.setAttribute('x', nodeX)
        // nodeNumberTextElement.setAttribute('y', nodeY)
        // nodeNumberTextElement.setAttribute('style',
        // 'font-style:normal;font-weight:normal;font-size:5.5833px;line-height:1.25;font-family:sans-serif;fill:#7fffff;fill-opacity:1;stroke:none;stroke-width:0.264583')
        // nodeNumberTextElement.textContent = nodeID
        // nodeNumbersLayer.appendChild(nodeNumberTextElement)
        // temporary для отображения номеров узлов
    }

    // проходим по всем ребрам и заносим информацию о смежных вершинах
    for (let i = 0; i < svgEdges.length; i++) {
        const edgeStart = svgEdges[i].getAttribute('inkscape:connection-start')
        const edgeEnd = svgEdges[i].getAttribute('inkscape:connection-end')

        const edgeStartID = edgeStart.slice('#path'.length)
        const edgeEndID = edgeEnd.slice('#path'.length)

        // вычисляем расстояние по всем известной формуле (теорема пифагора)
        const startNodeX = parseFloat(svgNodes['path' + edgeStartID].getAttribute('cx'))
        const startNodeY = parseFloat(svgNodes['path' + edgeStartID].getAttribute('cy'))
        const endNodeX = parseFloat(svgNodes['path' + edgeEndID].getAttribute('cx'))
        const endNodeY = parseFloat(svgNodes['path' + edgeEndID].getAttribute('cy'))

        // const nodesDistance = parseFloat(Math.sqrt((endNodeX - startNodeX) ** 2 + (endNodeY - startNodeY) ** 2).toFixed(2))
        const nodesDistance = parseFloat(Math.round(Math.sqrt((endNodeX - startNodeX) ** 2 + (endNodeY - startNodeY) ** 2)))

        // граф неориентированный, поэтому добавляем соседей симметрично
        graphNodes[edgeStartID].appendNeighbor(graphNodes[edgeEndID], nodesDistance)
        graphNodes[edgeEndID].appendNeighbor(graphNodes[edgeStartID], nodesDistance)

        // temporary расставляем длины ребер
        // const distanceTextElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        // distanceTextElement.setAttribute('x', (startNodeX + endNodeX) / 2 + 1)
        // distanceTextElement.setAttribute('y', (startNodeY + endNodeY) / 2 - 1)
        // distanceTextElement.setAttribute('style',
        // 'font-style:normal;font-weight:normal;font-size:5.5833px;line-height:1.25;font-family:sans-serif;fill:#000000;fill-opacity:1;stroke:none;stroke-width:0.264583')
        // distanceTextElement.textContent = nodesDistance
        // edgeValuesLayer.appendChild(distanceTextElement)
        // temporary расставляем длины ребер
    }

    // реализуем алгоритм поиска
    // Дейкстра
    function findRoute(fromNodeID, toNodeID) {
        // очередь непосещенных вершин с приоритетом по значению метки shortestPathSoFar
        let unvisitedNodes = []

        // инициализация меток вершин графа для работы алгоритма
        // и инициализация очереди непосещенных вершин
        for (let nodeNum in graphNodes) {
            const node = graphNodes[nodeNum]
            if (node.nodeID === fromNodeID) {
                node.shortestPathSoFar = 0
                unvisitedNodes.unshift(node) // на первое место ставим начальный узел
            } else {
                node.shortestPathSoFar = Number.POSITIVE_INFINITY
                unvisitedNodes.push(node)
            }
            node.cameFromNodeID = undefined
        }

        // // массив (объект) пар номер:непосещеннаяВершина
        // let unvisitedNodes = Object.assign({}, graphNodes)

        // let curNode = graphNodes[fromNodeID]
        let curNode
        // while (Object.keys(unvisitedNodes).length !== 0) {
        while (unvisitedNodes.length !== 0) { // выполняем алгоритм пока есть непосещенные узлы
            // берем следующий узел - непосещенную вершину с наименьшим значением метки shortestPathSoFar
            // в очереди с приоритетом этот узел будет наверху
            curNode = unvisitedNodes.shift()
            // console.log(curNode);

            // delete unvisitedNodes[curNode.nodeID]

            if (curNode.nodeID === toNodeID) { // или пока не обработали конечную вершину
                break
            }

            // массив соседей данной вершины, состоящий из пар node:distanceToNode
            const curNeighbors = curNode.neighbors.slice()

            // обновляем метки соседей
            for (let i = 0; i < curNeighbors.length; i++) {
                // рассматриваем только непосещенные узлы
                // if (unvisitedNodes.hasOwnProperty(curNeighbors[i].node.nodeID)) {
                let curNeighborIdx = unvisitedNodes.indexOf(curNeighbors[i].node)
                if (curNeighborIdx !== -1) { // если сосед есть в очереди непосещенных вершин
                    const pathToNeighbor = curNeighbors[i].distanceToNode
                    if (curNode.shortestPathSoFar + pathToNeighbor < curNeighbors[i].node.shortestPathSoFar) {
                        curNeighbors[i].node.shortestPathSoFar = curNode.shortestPathSoFar + pathToNeighbor
                        curNeighbors[i].node.cameFromNodeID = curNode.nodeID

                        for (let j = 0; j < unvisitedNodes.length; j++) {
                            if (curNeighbors[i].node.shortestPathSoFar < unvisitedNodes[j].shortestPathSoFar) {
                                // удаляем узел со старого места в очереди
                                let removed = unvisitedNodes.splice(curNeighborIdx, 1)
                                // вставляем узел на новое место в очереди
                                unvisitedNodes.splice(j, 0, curNeighbors[i].node)
                                break
                            }
                        }
                    }
                }
            }

            // // ищем следующий узел - непосещенную вершину с наименьшим значением метки shortestPathSoFar
            // let minDistance = Number.POSITIVE_INFINITY
            // let nextNode
            // for (let nodeNum in unvisitedNodes) {
            //     const node = unvisitedNodes[nodeNum]
            //     if (node.shortestPathSoFar < minDistance) {
            //         minDistance = node.shortestPathSoFar
            //         nextNode = node
            //     }
            // }
            // curNode = nextNode
        }

        // составление маршрута - идем от конечной вершины к начальной
        let routeNodes = []
        curNode = graphNodes[toNodeID]
        while (curNode.nodeID !== fromNodeID) {
            routeNodes.push(curNode.nodeID)
            curNode = graphNodes[curNode.cameFromNodeID]
        }
        routeNodes.push(fromNodeID)
        // и затем обращаем порядок вершин
        routeNodes.reverse()

        return {
            route: routeNodes,
            minPathValue: graphNodes[toNodeID].shortestPathSoFar
        }
    }

    // задача 3: построение маршрута
    // inputFrom.addEventListener('keyup', (event) => {
    //     if (event.keyCode === 13) {
    //         event.preventDefault()
    //         inputWhere.focus()
    //     }
    // })
    // inputWhere.addEventListener('keyup', (event) => {
    //     if (event.keyCode === 13) {
    //         event.preventDefault()
    //         buttonRoute.click()
    //         inputFrom.focus()
    //     }
    // })

    let paths = []
    // function createRoute() {
    //     const startRoom = inputFrom.value.toLowerCase()
    //     const endRoom = inputWhere.value.toLowerCase()
    //     if (startRoom === '' || endRoom === '') {
    //         return
    //     }
    //     inputFrom.value = ''
    //     inputWhere.value = ''
    //
    //     let foundStartRoom = svgRooms[startRoom]
    //     let foundEndRoom = svgRooms[endRoom]
    //     let startNodeID
    //     let endNodeID
    //
    //     // обрабатываем окошко поиска
    //     roomFindOrFail(foundStartRoom, inputFrom)
    //     if (foundStartRoom !== undefined) {
    //         // и получаем айди соответсвующего узла графа
    //         startNodeID = foundStartRoom.querySelector('circle').getAttribute('id').slice('path'.length)
    //     } else {
    //         return
    //     }
    //     roomFindOrFail(foundEndRoom, inputWhere)
    //     if (foundEndRoom !== undefined) {
    //         endNodeID = foundEndRoom.querySelector('circle').getAttribute('id').slice('path'.length)
    //     } else {
    //         return
    //     }
    //
    //     const routeSolution = findRoute(startNodeID, endNodeID)
    //     console.log("Маршрут:", routeSolution.route)
    //     console.log("Длина пути:", routeSolution.minPathValue)
    //
    //     // рисуем линию
    //     const pathLine = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    //     pathLine.setAttribute('fill', 'none')
    //     const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
    //     pathLine.setAttribute('stroke', randomColor)
    //     pathLine.setAttribute('stroke-linecap', 'round')
    //     pathLine.setAttribute('stroke-linejoin', 'round')
    //     pathLine.setAttribute('stroke-width', '5px')
    //     let pathLineDescription = 'M '
    //     for (let i = 0; i < routeSolution.route.length - 1; i++) {
    //         let firstNode = svgNodes['path' + routeSolution.route[i]]
    //         let secondNode = svgNodes['path' + routeSolution.route[i + 1]]
    //         pathLineDescription += firstNode.getAttribute('cx') + ' ' + firstNode.getAttribute('cy') + ' '  + secondNode.getAttribute('cx') + ' ' + secondNode.getAttribute('cy') + ' '
    //     }
    //     pathLine.setAttribute('d', pathLineDescription)
    //     svgEdgesLayer.appendChild(pathLine)
    //     paths.push(pathLine)
    // }
    // buttonRoute.addEventListener('click', createRoute)

    let startRoom, endRoom
    function createRouteV2() {
        startNodeID = startRoom.querySelector('circle').getAttribute('id').slice('path'.length)
        endNodeID = endRoom.querySelector('circle').getAttribute('id').slice('path'.length)

        const routeSolution = findRoute(startNodeID, endNodeID)
        console.log("Маршрут:", routeSolution.route)
        console.log("Длина пути:", routeSolution.minPathValue)

        // закрашиваем помещения
        const redValue = Math.floor(Math.random() * 16).toString(16).repeat(2)
        const greenValue = Math.floor(Math.random() * 16).toString(16).repeat(2)
        const blueValue = Math.floor(Math.random() * 16).toString(16).repeat(2)
        const randomColor = '#' + redValue + greenValue + blueValue
        startRoom.querySelector('path').style.setProperty('fill', randomColor)
        startRoom.querySelector('path').style.setProperty('opacity', '1')
        endRoom.querySelector('path').style.setProperty('fill', randomColor)
        endRoom.querySelector('path').style.setProperty('opacity', '1')

        // рисуем линию
        const pathLine = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        pathLine.setAttribute('fill', 'none')
        pathLine.setAttribute('stroke', randomColor)
        pathLine.setAttribute('stroke-linecap', 'round')
        pathLine.setAttribute('stroke-linejoin', 'round')
        pathLine.setAttribute('stroke-width', '5px')
        let pathLineDescription = 'M '
        for (let i = 0; i < routeSolution.route.length - 1; i++) {
            let firstNode = svgNodes['path' + routeSolution.route[i]]
            let secondNode = svgNodes['path' + routeSolution.route[i + 1]]
            pathLineDescription += firstNode.getAttribute('cx') + ' ' + firstNode.getAttribute('cy') + ' '  + secondNode.getAttribute('cx') + ' ' + secondNode.getAttribute('cy') + ' '
        }
        pathLine.setAttribute('d', pathLineDescription)
        svgEdgesLayer.appendChild(pathLine)
        paths.push(pathLine)

        startRoom = undefined
        endRoom = undefined
    }

    function clearRoutes() {
        for (let i = 0; i < paths.length; i++) {
            svgEdgesLayer.removeChild(paths[i])
        }
        paths = []
    }
    // buttonClear.addEventListener('click', clearRoutes)

    buttonFrom.addEventListener('click', function() {
        clearRoutes()
        divRoomDesc.style.setProperty('display', 'none')

        if (startRoom !== curRoom) {
            startRoom = curRoom
            console.log("FROM:", startRoom);
        }
        if (endRoom !== undefined) {
            createRouteV2()
        }
    })
    buttonTo.addEventListener('click', function() {
        clearRoutes()
        divRoomDesc.style.setProperty('display', 'none')

        if (endRoom !== curRoom) {
            endRoom = curRoom
            console.log("TO:", endRoom);
        }
        if (startRoom !== undefined) {
            createRouteV2()
        }
    })
}



//
//     const svgPoint = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
//     svgPoint.setAttribute('id', rooms[i].getAttribute('inkscape:label') + 'point')
//     svgPoint.setAttribute('r', '3px')
//     svgPoint.setAttribute('fill', '#0083bd')
//