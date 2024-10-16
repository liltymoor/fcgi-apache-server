// собрать вебпаком весь калл в один бандл обфусицированный минифицированный и его закинуть в статику
var lastHitIdx      = 0;
var pageNumber      = 0;
const pageContentLen  = 10;



class HitData {
    x;y;r;isHit;exec_time;exec_data;
    constructor(x, y, r, isHit, exec_time, exec_data) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.isHit = isHit;
        this.exec_time = exec_time;
        this.exec_data = exec_data;
    }


    get x() {
        return this.x;
    }

    get y() {
        return this.y;
    }

    get r() {
        return this.r;
    }

    get isHit() {
        return this.isHit;
    }

    get exec_time() {
        return this.exec_time;
    }

    get exec_data() {
        return this.exec_data;
    }
}

function addTableRow(hitObject) {
    const tableBody = document.querySelector("#resultTable tbody");
    const rowNumber = tableBody.rows.length + 1;
    const newRow = document.createElement('tr');

    newRow.innerHTML = `
        <td>${rowNumber}</td>
        <td>${hitObject.x}</td>
        <td>${hitObject.y}</td>
        <td>${hitObject.r}</td>
        <td>${hitObject.isHit}</td>
        <td>${hitObject.exec_time}</td>
        <td>${hitObject.exec_data}</td>
    `;

    tableBody.appendChild(newRow);
}

function getPageContent(pageNum) {
    const content = [];

    for (let i = 0; i < pageContentLen; i++) {
        const hitObject = localStorage.getItem(pageNum * pageContentLen + i);
        if (hitObject === null) return content;

        content.push(hitObject);
    }

    return content;
}

function setTableContent(pageNum) {
    if (pageNum < 0) return;

    const tableBody = document.querySelector("#resultTable tbody");
    tableBody.innerHTML = ''; // clear table

    const content = getPageContent(pageNum);
    content.forEach((hitObject) => addTableRow(hitObject));
}

function addToStorage(hitObject) {
    localStorage.setItem(lastHitIdx.toString(), hitObject);
    lastHitIdx++;
}

function isActualElement(elementIndex) {
    if (elementIndex < lastHitIdx) return;
    return ((elementIndex % pageContentLen) + (pageNumber * pageContentLen)) < pageContentLen * (pageNumber + 1);
}

function nextPage() {
    if (lastHitIdx < (pageNumber + 1) * pageContentLen) return;
    setTableContent(pageNumber++);
}

function prevPage() {
    if (pageNumber === 0) return;
    setTableContent(pageNumber--);
}

$(document).ready(function () {

    $('#x-buttons button').on('click', function () {
        const value = $(this).data('value');
        $('#x').val(value);
        $('#x-buttons button').removeClass('active');
        $(this).addClass('active');
    });

    $('#r-buttons button').on('click', function () {
        const value = $(this).data('value');
        $('#r').val(value);
        $('#r-buttons button').removeClass('active');
        $(this).addClass('active');
    });

    $("#coordinateForm").on("submit", function (event) {
        event.preventDefault();

        const x = $("#x").val();
        const y = $("#y").val();
        const r = $("#r").val();

        $.ajax({
            url: "/fcgi-bin/fast-cgi-timmie.jar",
            type: "POST",
            data: {
                x: x,
                y: y,
                r: r
            },
            success: function (response) {
                response = JSON.parse(response)
                const hitObject = new HitData(x,y,r, response.intersects, response.exec_time / 1000000, response.exec_date);
                addTableRow(hitObject);
                if (isActualElement(lastHitIdx)) {
                    addToStorage(hitObject);
                    setTableContent(pageNumber);
                    return;
                }
                addToStorage(hitObject);
                setTableContent(pageNumber++);
            },
            error: function (e) {
                alert("Ошибка при отправке данных. | " + JSON.stringify(e));
            }
        });
    });
});

window.onload = function () {
    var canvas = document.getElementById('myCanvas');
    var ctx = canvas.getContext('2d');
    var R = 100; // Радиус R

    // Нарисуем фигуру
    drawShape(ctx, R);
};

// Функция для рисования фигуры
function drawShape(ctx, R) {
    const xCenter = 125;
    const yCenter = 125;
    ctx.fillStyle = '#4287f5';
    //Прямоугольник
    ctx.fillRect(xCenter - R, yCenter, R, R / 2);


    // Прямоугольный треугольник
    ctx.beginPath()
    ctx.moveTo(xCenter, yCenter);
    ctx.lineTo(xCenter - R, yCenter);
    ctx.lineTo(xCenter, yCenter - R / 2);
    ctx.lineTo(xCenter, yCenter);
    ctx.fill();

    // Четверть круга
    ctx.beginPath();
    ctx.moveTo(xCenter, yCenter);
    ctx.arc(xCenter, yCenter, R, -Math.PI / 2, 0, false);
    ctx.closePath();
    ctx.fill();

    // Оси
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;

    // Ось X
    ctx.beginPath();
    ctx.moveTo(xCenter - R, yCenter);
    ctx.lineTo(xCenter + R, yCenter);
    ctx.stroke();

    // Ось Y
    ctx.beginPath();
    ctx.moveTo(xCenter, yCenter + R);
    ctx.lineTo(xCenter, yCenter - R);
    ctx.stroke();

    // Отметки на осях
    ctx.font = '15px Arial';
    ctx.fillStyle = 'black';
    ctx.fillText('-R', xCenter - R, yCenter + 15);
    ctx.fillText('-R/2', xCenter - R / 2, yCenter + 15);
    ctx.fillText('R/2', xCenter + R / 2, yCenter + 15);
    ctx.fillText('R', xCenter + R, yCenter + 15);
    ctx.fillText('-R', xCenter + 5, yCenter + R);
    ctx.fillText('-R/2', xCenter + 5, yCenter + R / 2);
    ctx.fillText('R/2', xCenter + 5, yCenter - R / 2);
    ctx.fillText('R', xCenter + 5, yCenter - R);
}