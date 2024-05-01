'use strict'

window.addEventListener('DOMContentLoaded', async () => { 
    async function getData() {
        const response = await fetch('./json/local.json');
        const dataRawJson = await response.json();
        return dataRawJson;
    }
    let dataJson = await getData();
    
    function selectPromptElems() {
        const PROMPTS = {
            errAll : document.getElementById('err-all'),
            errCode : document.getElementById('err-code'),
            errCount : document.getElementById('err-count'),
            errUpperCase : document.getElementById('err-upper-case'),
            errLatin : document.getElementById('err-latin'),
            errQty : document.getElementById('err-qty'),
            msgCheckCode : document.getElementById('msg-check-code'),
            msgCodeOk : document.getElementById('msg-code-ok')
        };
        return PROMPTS;
    }

    function getUserInput() {
        let inputData = {};
        let inputCode = document.getElementById('input-code');
        let inputCount = document.getElementById('input-count');
        let inputQty = document.getElementById('input-qty');
        inputData.code = inputCode.value.trim();
        inputData.count = inputCount.value.trim();
        inputData.qty = inputQty.value.trim();
        return inputData;
    }

    function checkInputData(dataJson, inputData, PROMPTS) {
        let errFlag = true;
        ///Check if input is blank
        if (inputData.code === '' || inputData.count === '' || inputData.qty === '') {
            PROMPTS.errAll.style.display = 'block';
            return errFlag;
        }
        ///Count check
        if (inputData.count > 24 || isNaN(inputData.count)) {
            PROMPTS.errCount.style.display = 'block';
            return errFlag;
        }
        ///Qty checks
        if (isNaN(inputData.qty) || !(inputData.qty)) {
            PROMPTS.errQty.style.display = 'block';
            return errFlag;
        }
        ///Code checks
        const regex = /[Α-Ζα-ζ]/;
        // const regex = /[A-Za-z]/;
        if (regex.test(inputData.code) === true) {
            PROMPTS.errLatin.style.display = 'block';
            return errFlag;
        }
        let flag = false;
        let i = 1375;
        do {
            console.log('inside for...');
            if (inputData.code === dataJson[i].barcode) {
                flag = true;
            }
            i++;
        } while (flag === false && i < dataJson.length);
        if (flag === false) {
            PROMPTS.errCode.style.display = 'block';
            return errFlag;
        }
    }

    function buildData(dataJson, inputData) {
        let data = {};
        for (let i = 0; i < dataJson.length; i++) {
            if (inputData.code === dataJson[i].barcode) {
                data = dataJson[i]
            }
        }
        return data;
    }

    function generateLabel(data, inputData) {
        let barcodeWidth = 66;
        let i = 0;
        if (globalCount !== 0) {
          i = globalCount;
          inputData.count = globalCount + Number(inputData.count);
        }
    
        for (i = globalCount; i < inputData.count; i++) {

            const name_array = data.name.split(" ")
            const subcat_array = data.subcat.split(" ")

            subcat_array.forEach(element => {
                const index = name_array.indexOf(element);
                if (index !== -1) {
                    name_array.splice(index, 1);
                }
            });

            let label = document.getElementById(`label-${i}`);

            //Generate Name
            let name = document.createElement('p');
            name.id = `name-${i}`;
            name.classList.add('name');
            label.appendChild(name);
            name.innerHTML = data.subcat;

            //Generate Size
            let size = document.createElement('p');
            label.appendChild(size);
            size.id = `size-${i}`;
            size.classList.add('size');
            size.innerHTML = name_array[0];
            
            //Generate Quantity
            let qty = document.createElement('p');
            label.appendChild(qty);
            qty.id = `qty-${i}`;
            qty.classList.add('qty');
            qty.innerHTML = inputData.qty;
            let tmx = document.createElement('span');
            tmx.classList.add('tmx');
            tmx.innerHTML = 'ΤΜΧ.';
            qty.appendChild(tmx);

            //Generate Image
            // let img = document.createElement('img');
            // label.appendChild(img);
            // img.id = `img-${i}`;
            // img.classList.add('img');
            // img.src = `./img/svg/912.svg`;

            let actualWidth = (barcodeWidth/data.barcode.length)*0.5
            //Generate Barcode
            JsBarcode(document.getElementById(`barcode-${i}`), data.barcode, {
                format: "CODE128",
                height: 50,
                displayValue: true,
                fontSize: 14,
                padding: 0.5,
                margin: 0,
                textMargin: 0.6,
                textAlign: "left",
                textPosition: "top",
                background: "#ffffff",
                lineColor: "#000000",
                fontOptions: "bold"
            });
            let elementWidth = document.getElementById(`barcode-${i}`).clientWidth;
            console.log(elementWidth)
            // document.getElementById(`barcode-${i}`).style.height = (elementWidth / 0.5);
        }
        globalCount = Number(inputData.count);
    }

    let PROMPTS = selectPromptElems();
    let globalCount = 0;

    let buttonCreate = document.getElementById('button-create');
    buttonCreate.addEventListener('click', () => {
        Object.entries(PROMPTS).forEach(([key,value])=>{
            value.style.display = 'none';
        });
        let inputData = getUserInput();
        let errFlag = checkInputData(dataJson, inputData, PROMPTS);
        if (errFlag) {
            return;
        } else {
            let data = buildData(dataJson, inputData);
            generateLabel(data, inputData);
    
            ///CLEAR INPUT FIELDS///
            document.getElementById('input-code').value = '';
            document.getElementById('input-count').value = '';
            document.getElementById('input-qty').value = '';
        }
    });

    let buttonPdf = document.getElementById('button-save');
    buttonPdf.addEventListener('click', function () {
      var element = document.getElementById('label-container');
      html2pdf()
        .set({
          margin: 0,
          filename: 'labels.pdf',
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { dpi: 192, scale: 4, letterRendering: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        })
        .from(element)
        .save();
    });
});