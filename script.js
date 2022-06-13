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

// массив из пар здание:массивЭтажей
buildingFloors = {
    'ГУК А': [2, 3],
    'ГУК Б': [2, 3, 4, 5],
    'ГУК В': [2, 3, 4, 5, 6],
}

let prevFloor, curFloor
let prevBuilding, curBuilding
let curBuildingFloors
inputBuildingPicker.addEventListener("change", () => {
    // скрываем floorpicker и див с описанием помещения
    document.querySelector('.floorpicker').style.setProperty('display', 'none')
    divRoomDesc.style.setProperty('display', 'none')
    // document.querySelector('.footer-route').style.setProperty('display', 'none')

    // удаляем предыдущие обработчики событий поиска аудитории
    removePrevHandlers()
    // удаляем svg предыдущего здания
    while (divFloorMap.firstChild) {
        divFloorMap.removeChild(divFloorMap.lastChild)
    }

    curBuilding = inputBuildingPicker.value
    // загружаем svg каждого этажа текущего здания и создаем floorPicker
    curBuildingFloors = buildingFloors[curBuilding]
    loadFloorSVG(0)

    // предыдущий этаж будет неопределенным, так как мы только что загрузили новый корпус
    prevFloor = undefined
    prevBuilding = curBuilding
})

// загружаем сразу все схемы одного здания
let svgFloorMapObjects = {}
function loadFloorSVG(curFloorIndex) {
    const floorNumber = curBuildingFloors[curFloorIndex]
    const newSVGObject = document.createElement('object')
    newSVGObject.setAttribute('class', 'floor-svg')
    newSVGObject.setAttribute('type', 'image/svg+xml')
    const buildingSVGLocation = './svgFolder/' + curBuilding + '_' + floorNumber + '.svg'
    newSVGObject.setAttribute('data', buildingSVGLocation)
    newSVGObject.setAttribute('width', '100%')
    newSVGObject.setAttribute('height', '100%')
    newSVGObject.style.setProperty('visibility', 'hidden')
    divFloorMap.appendChild(newSVGObject)
    svgFloorMapObjects[floorNumber] = newSVGObject

    // как только загрузили последний этаж - запускаем обработку всех схем
    if (curFloorIndex === curBuildingFloors.length - 1) {
        newSVGObject.addEventListener('load', () => {
            workWithSVGs()
            // после обработки схем - создаем новый floorPicker
            createFloorPicker()
        })
        return
    }

    // перед загрузкой следующей схемы ждем, пока загрузится текущая - чтобы затем можно было работать со всеми схемами
    newSVGObject.addEventListener('load', () => {
        loadFloorSVG(curFloorIndex + 1, curBuildingFloors)
    })
}

let floorButtons = {}
function createFloorPicker() {
    while (listFloorPicker.firstChild) {
        listFloorPicker.removeChild(listFloorPicker.lastChild)
    }

    buildingFloors[curBuilding].forEach(floorNumber => {
        const newFloorListItem = document.createElement('li')
        listFloorPicker.appendChild(newFloorListItem)
        const newFloorButton = document.createElement('button')
        newFloorButton.textContent = floorNumber.toString()
        newFloorListItem.appendChild(newFloorButton)

        floorButtons[floorNumber] = newFloorButton

        // при нажатии на кнопку этажа загружаем нужную схему
        newFloorButton.addEventListener('click', function() {
            curFloor = this.textContent
            // проверяем условие, чтобы не загружать ту же самую схему
            if (!(curFloor === prevFloor && curBuilding === prevBuilding)) {
                // скрываем прошлый этаж
                if (prevFloor !== undefined) {
                    svgFloorMapObjects[prevFloor].style.setProperty('visibility', 'hidden')
                    floorButtons[prevFloor].removeAttribute('class')
                }
                // закрашиваем кнопку текущего этажа
                this.setAttribute('class', 'clicked')
                // скрываем див с описанием помещения
                divRoomDesc.style.setProperty('display', 'none')

                // // удаляем предыдущие обработчики событий поиска аудитории
                // removePrevHandlers()

                // работаем с новым этажом
                svgFloorMapObjects[curFloor].style.setProperty('visibility', 'visible')
                // workWithSVG(svgFloorMapObjects[curFloor])

                prevFloor = curFloor
            }
        })
    })
    // после создания показываем пользователю
    document.querySelector('.floorpicker').style.setProperty('display', 'block')
}

function workWithSVGs() {
    // скрываем карту для обработки
    document.querySelector('.map-and-floorpicker').style.setProperty('display', 'none')

    // переменные для клика и построения маршрута
    let curRoom
    let routeIsDrawn = false
    let startRoom, endRoom
    let startFloor, endFloor

//                                      Работаем с помещениями
    let allRooms = []
    for (let floorNumber of Object.keys(svgFloorMapObjects)) {
        let svgObject = svgFloorMapObjects[floorNumber]
        const svgDocument = svgObject.contentDocument
        const svgElement = svgDocument.querySelector('svg')

        // каждый элемент svgRooms - svg группа, состоящая из описания desc, условного обозначения text, геометриечской формы path и узла графа для поиска circle
        let svgRooms = Object.assign({}, svgDocument.querySelectorAll('svg g[*|label="rooms"] g, svg g[*|label="stairsAndElevators"] g')) // содержит в себе помещения, лестницы и лифты
        allRooms = allRooms.concat(svgDocument.querySelectorAll('svg g[*|label="rooms"] g, svg g[*|label="stairsAndElevators"] g'))

        function makeRoomDefault(svgRoom) {
            svgRoom.querySelector('path').setAttribute('style', 'fill: #0083bd; opacity: 0; transition-duration: 0.3s')
        }

        // предобрабатываем схему перед тем, как показать пользователю
        for (let i of Object.keys(svgRooms)) {
            svgRooms[i].style.setProperty('cursor', 'pointer')
            svgRooms[i].style.setProperty('pointer-events', 'all')

            // скрываем формы помещений
            makeRoomDefault(svgRooms[i])

            // если нет названия и описания - ставим дефолтное
            let roomDesc = svgRooms[i].querySelector('desc')
            if (roomDesc === null) {
                roomDesc = svgDocument.createElement('desc')
                roomDesc.textContent = 'Помещение'
                svgRooms[i].appendChild(roomDesc)
            }
            const roomShape = svgRooms[i].querySelector('path')

            // выделяем выбранные курсором помещения
            svgRooms[i].addEventListener('mouseenter', function() {
                if (!(this === curRoom || this === startRoom || this === endRoom)) {
                        roomShape.style.setProperty('opacity', '0.3')
                }
                // if (routeIsDrawn) {
                //     if (this === startRoom || this === endRoom) {
                //         return
                //     }
                // }
                // if (!(curRoom === this)) {
                //     roomShape.style.setProperty('opacity', '0.3')
                // }
            })
            svgRooms[i].addEventListener('mouseleave', function() {
                if (!(this === curRoom || this === startRoom || this === endRoom)) {
                        roomShape.style.setProperty('opacity', '0')
                }
                // if (routeIsDrawn) {
                //     if (this === startRoom || this === endRoom) {
                //         return
                //     }
                // }
                // if (!(curRoom === this)) {
                //     roomShape.style.setProperty('opacity', '0')
                // }
            })
            svgRooms[i].addEventListener('click', () => {roomClick(svgRooms[i])})
        }
        // svgObject.style.setProperty('visibility', 'visible')
        document.querySelector('.map-and-floorpicker').style.setProperty('display', 'block')

        // задача 2: вывод информации о помещении
        function roomClick(clickedRoom) {
            // если уже кликнули на другое помещение - убираем его выделение
            // здесь curRoom - помещение, которое станет предыдущим
            if (curRoom !== undefined) {
                if (!(curRoom === startRoom || curRoom === endRoom)) {
                    makeRoomDefault(curRoom)
                }
                if (curRoom === clickedRoom) {
                    curRoom = undefined
                    divRoomDesc.style.setProperty('display', 'none')
                    return
                }
            }
            curRoom = clickedRoom
            if (!(curRoom === startRoom || curRoom === endRoom)) {
                curRoom.querySelector('path').style.setProperty('opacity', '0.7')
            }
            // получаем название и описание помещения
            let roomDescription = curRoom.querySelector('desc')
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


    }






    // console.log(allRooms);

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
            if (foundRoom !== curRoom) {
                roomClick(foundRoom)
            }
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
        let searchResult = [] // массив из пар номерЭтажа:помещение
        let foundRooms = []

        for (let floorIdx = 0; floorIdx < allRooms.length; floorIdx++) { // для каждого этажа
            foundRooms = Array.from(allRooms[floorIdx])

            for (let i = 0; i < neededRoomNameWords.length; i++) { // для каждого слова

                for (let j = 0; j < foundRooms.length; j++) {
                    let curRoomName = foundRooms[j].querySelector('desc').textContent.split('\n', 1)[0].toLowerCase().split(' ')
                    // console.log(j, foundRooms[j], curRoomName);
                    if (!curRoomName.includes(neededRoomNameWords[i])) {
                        foundRooms.splice(j, 1)
                        j--
                    }
                }
            }
            for (var j = 0; j < foundRooms.length; j++) {
                searchResult.push([curBuildingFloors[floorIdx], foundRooms[j]])
            }
        }

        // если нашли несколько совпадений, то... (пока что отображаем только последнее найденное помещение)
        if (searchResult.length === 0) {
            roomFindOrFail(undefined, inputFind)
        } else {
            searchResult.forEach((item, i) => {
                floorButtons[item[0]].click()
                roomFindOrFail(item[1], inputFind)
            })
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
    let allSVGNodes = {}
    let allGraphNodes = {}
    let allSVGEdgesLayers = {}
    for (let floorNumber of Object.keys(svgFloorMapObjects)) {
        let svgObject = svgFloorMapObjects[floorNumber]
        const svgDocument = svgObject.contentDocument
        const svgElement = svgDocument.querySelector('svg')

        // собираем узлы из слоя с узлами graphNodes и из всех комнат из слоя rooms
        const svgNodesTemp = Object.assign({}, svgDocument.querySelectorAll('svg g[*|label="graphNodes"] *, svg g[*|label="rooms"] circle, svg g[*|label="stairsAndElevators"] circle'))

        let svgNodes = {}
        // добавляем ключей для более удобного поиска (так как это NodeList, в HTMLCollection это почему-то делается автоматически...)
        for (let oldKey of Object.keys(svgNodesTemp)) {
            let newKey = svgNodesTemp[oldKey].getAttribute('id')
            svgNodes[newKey] = svgNodesTemp[oldKey]
        }
        delete svgNodesTemp

        // allSVGNodes = allSVGNodes.concat(svgNodes)
        allSVGNodes[floorNumber] = svgNodes

        const svgEdgesLayer = svgDocument.querySelector('svg g[*|label="graphEdges"]')
        const svgEdges = svgEdgesLayer.children

        // allSVGEdgesLayers = allSVGEdgesLayers.concat(svgEdgesLayer)
        allSVGEdgesLayers[floorNumber] = svgEdgesLayer

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
            // const sliceStart = 'path'.length
            // const nodeID = svgNodes[i].getAttribute('id').slice(sliceStart)

            const nodeID = svgNodes[i].getAttribute('id')
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

            // const edgeStartID = edgeStart.slice('#path'.length)
            // const edgeEndID = edgeEnd.slice('#path'.length)

            const edgeStartID = edgeStart.slice('#'.length)
            const edgeEndID = edgeEnd.slice('#'.length)

            // вычисляем расстояние по всем известной формуле (теорема пифагора)
            const startNodeX = parseFloat(svgNodes[edgeStartID].getAttribute('cx'))
            const startNodeY = parseFloat(svgNodes[edgeStartID].getAttribute('cy'))
            const endNodeX = parseFloat(svgNodes[edgeEndID].getAttribute('cx'))
            const endNodeY = parseFloat(svgNodes[edgeEndID].getAttribute('cy'))

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

        // allGraphNodes = allGraphNodes.concat(graphNodes)
        allGraphNodes[floorNumber] = graphNodes

    }


    // console.log(allSVGNodes);
    // console.log(allGraphNodes);
    // console.log(allSVGEdgesLayers);

    // реализуем алгоритм поиска
    // Дейкстра
    function findRoute(graphNodes, fromNodeID, toNodeID) {
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

        let curNode
        while (unvisitedNodes.length !== 0) { // выполняем алгоритм пока есть непосещенные узлы
            // берем следующий узел - непосещенную вершину с наименьшим значением метки shortestPathSoFar
            // в очереди с приоритетом этот узел будет наверху
            curNode = unvisitedNodes.shift()

            if (curNode.nodeID === toNodeID) { // или пока не обработали конечную вершину
                break
            }

            // массив соседей данной вершины, состоящий из пар node:distanceToNode
            const curNeighbors = curNode.neighbors.slice()

            // обновляем метки соседей
            for (let i = 0; i < curNeighbors.length; i++) {
                // рассматриваем только непосещенные узлы
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
    // случайный цвет для закрашивания маршрута
    function getRandomColor() {
        const redValue = Math.floor(Math.random() * 16).toString(16).repeat(2)
        const greenValue = Math.floor(Math.random() * 16).toString(16).repeat(2)
        const blueValue = Math.floor(Math.random() * 16).toString(16).repeat(2)
        const randomColor = '#' + redValue + greenValue + blueValue
        return randomColor
    }
    let randomColor = getRandomColor()

    let paths = []
    function createRoute() {
        let routeIdx = parseInt(startFloor)
        let curStartRoom = startRoom
        let curEndRoom = endRoom
        do {
            graphNodes = allGraphNodes[routeIdx]
            svgNodes = allSVGNodes[routeIdx]
            svgEdgesLayer = allSVGEdgesLayers[routeIdx]



            // // если конечная комната на другом этаже - ищем ближайший лифт/лестницу
            // if (routeIdx !== parseInt(endFloor)) {
            //     const upwards = svgDocument.querySelectorAll('svg g[*|label="stairsAndElevators"] g')
            //     let minDistance = Number.POSITIVE_INFINITY
            //     let nearestUpwards
            //     for (let i = 0; i < upwards.length; i++) {
            //         let
            //         if (true) {
            //             nearestUpwards = upwards[i]
            //         } array[i]
            //     }
            //     curEndRoom =
            //      Math.sign(parseInt(endFloor) - parseInt(startFloor))
            // } else {
            //
            // }

            // если у помещения несколько вершин - ищем маршруты для каждой из них и выбираем кратчайший
            startRoomNodes = curStartRoom.querySelectorAll('circle')
            endRoomNodes = curEndRoom.querySelectorAll('circle')
            let startNode, endNode
            let minPath = Number.POSITIVE_INFINITY
            let minSolution
            for (let i = 0; i < startRoomNodes.length; i++) {
                for (let j = 0; j < endRoomNodes.length; j++) {
                    startNode = startRoomNodes[i]
                    endNode = endRoomNodes[j]

                    startNodeID = startNode.getAttribute('id')
                    endNodeID = endNode.getAttribute('id')

                    const routeSolution = findRoute(graphNodes, startNodeID, endNodeID)
                    if (routeSolution.minPathValue < minPath) {
                        minPath = routeSolution.minPathValue
                        minSolution = routeSolution
                    }

                }
            }
            console.log("Маршрут:", minSolution.route)
            console.log("Длина пути:", minSolution.minPathValue)

            // закрашиваем помещения
            curStartRoom.querySelector('path').style.setProperty('fill', randomColor)
            curStartRoom.querySelector('path').style.setProperty('opacity', '1')
            curEndRoom.querySelector('path').style.setProperty('fill', randomColor)
            curEndRoom.querySelector('path').style.setProperty('opacity', '1')

            // рисуем линию
            const pathLine = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            pathLine.setAttribute('fill', 'none')
            pathLine.setAttribute('stroke', randomColor)
            pathLine.setAttribute('stroke-linecap', 'round')
            pathLine.setAttribute('stroke-linejoin', 'round')
            // ширина линии - диаметр вершин графа (решение не очень но пока пусть будет так)
            const pathLineWidth = parseFloat(startNode.getAttribute('r')) * 2
            pathLine.setAttribute('stroke-width', pathLineWidth)
            let pathLineDescription = 'M '
            for (let i = 0; i < minSolution.route.length - 1; i++) {
                let firstNode = svgNodes[minSolution.route[i]]
                let secondNode = svgNodes[minSolution.route[i + 1]]
                pathLineDescription += firstNode.getAttribute('cx') + ' ' + firstNode.getAttribute('cy') + ' '  + secondNode.getAttribute('cx') + ' ' + secondNode.getAttribute('cy') + ' '
            }
            pathLine.setAttribute('d', pathLineDescription)
            // удаляем маршрут по клику на него
            pathLine.style.setProperty('cursor', 'pointer')
            pathLine.addEventListener('click', () => {
                clearRoute()
            })
            svgEdgesLayer.appendChild(pathLine)
            paths.push(pathLine)

            routeIsDrawn = true

            routeIdx += Math.sign(parseInt(endFloor) - parseInt(startFloor))
            curStartRoom = curEndRoom
        } while (routeIdx !== parseInt(endFloor));
    }

    // // версия для нескольких маршрутов
    // function clearRoutes() {
    //     for (let i = 0; i < paths.length; i++) {
    //         svgEdgesLayer.removeChild(paths[i])
    //     }
    //     paths = []
    //     routeIsDrawn = false
    // }
    // // buttonClear.addEventListener('click', clearRoutes)

    function clearRoute() {
        // возвращаем прежний стиль начальному и конечному помещениям
        makeRoomDefault(startRoom)
        makeRoomDefault(endRoom)
        // если одно из этих помещений было нажато -  изменяем его стиль на обычный кликнутый
        if (curRoom === startRoom || curRoom === endRoom) {
            curRoom.querySelector('path').style.setProperty('opacity', '0.7')
        }

        // удаляем путь
        svgEdgesLayer.removeChild(paths[0])
        paths = []
        routeIsDrawn = false
        startRoom = undefined
        endRoom = undefined

        // получаем новый цвет для следующего маршрута
        randomColor = getRandomColor()
    }

    buttonFrom.addEventListener('click', function() {
        // если у помещения нет вершин графа - подсвечиваем его красным и ждем другого
        if (curRoom.querySelector('circle') === null) {
            const prevStyle = curRoom.querySelector('path').getAttribute('style')
            curRoom.querySelector('path').setAttribute('style', 'fill: red; opacity: 0.5; transition-duration: 0.3s')
            setTimeout(function () {
                curRoom.querySelector('path').setAttribute('style', prevStyle)
            }, 700);
            return
        }

        if (routeIsDrawn) {
            clearRoute()
        }

        // если уже было выбрано другое помещение - убираем у него выделение
        if (startRoom !== undefined) {
            makeRoomDefault(startRoom)
        }

        startRoom = curRoom
        startFloor = curFloor
        console.log("FROM:", startFloor, "floor,", startRoom);

        // закрашиваем как начальную точку
        startRoom.querySelector('path').style.setProperty('fill', randomColor)
        startRoom.querySelector('path').style.setProperty('opacity', '1')

        // divRoomDesc.style.setProperty('display', 'none')
        // curRoom = undefined

        // если указали помещение как начальную и конечную точку - ставим последнее состояние
        if (endRoom === startRoom) {
            endRoom = undefined
        }
        if (endRoom !== undefined) {
            createRoute()
        }
    })
    buttonTo.addEventListener('click', function() {
        // если у помещения нет вершин графа - подсвечиваем его красным и ждем другого
        if (curRoom.querySelector('circle') === null) {
            const prevStyle = curRoom.querySelector('path').getAttribute('style')
            curRoom.querySelector('path').setAttribute('style', 'fill: red; opacity: 0.5; transition-duration: 0.3s')
            setTimeout(function () {
                curRoom.querySelector('path').setAttribute('style', prevStyle)
            }, 700);
            return
        }

        if (routeIsDrawn) {
            clearRoute()
        }

        // если уже было выбрано другое помещение - убираем у него выделение
        if (endRoom !== undefined) {
            makeRoomDefault(endRoom)
        }

        endRoom = curRoom
        endFloor = curFloor
        console.log("TO:", endFloor, "floor,", endRoom);

        // закрашиваем как конечную точку
        endRoom.querySelector('path').style.setProperty('fill', randomColor)
        endRoom.querySelector('path').style.setProperty('opacity', '1')

        // divRoomDesc.style.setProperty('display', 'none')
        // curRoom = undefined

        // если указали помещение как начальную и конечную точку - ставим последнее состояние
        if (startRoom === endRoom) {
            startRoom = undefined
        }
        if (startRoom !== undefined) {
            createRoute()
        }
    })

}