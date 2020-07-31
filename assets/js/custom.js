window.console = window.console || function(t) {};

if (document.location.search.match(/type=embed/gi)) {
    window.parent.postMessage("resize", "*");
}



let imgBase64 = null;  
let labelsJson = null;
let labelsOcorrencia = [];

let incendio = false;
let incendioVeiculo = false;
let incendioVegetacao = false;
let incendioEstrutural = false;

$('#fileup').change(function () {


  const preview = document.querySelector('img');
  const file = document.querySelector('input[type=file]').files[0];
  const reader = new FileReader();

  reader.addEventListener("load", function () {
    // convert image file to base64 string
    //console.log(reader.result);
    imgBase64 = reader.result.split("base64,")[1];
    //console.log(imgBase64);
    //preview.src = reader.result;
  }, false);
  //aciona o evento addEventListener
  reader.readAsDataURL(file);


  //here we take the file extension and set an array of valid extensions
  var res = $('#fileup').val();
  var arr = res.split("\\");
  var filename = arr.slice(-1)[0];
  filextension = filename.split(".");
  filext = "." + filextension.slice(-1)[0];
  valid = [".jpg", ".png", ".jpeg", ".bmp"];
  //if file is not valid we show the error icon, the red alert, and hide the submit button
  if (valid.indexOf(filext.toLowerCase()) == -1) {
    $(".imgupload").hide("slow");
    $(".imgupload.ok").hide("slow");
    $(".imgupload.stop").show("slow");

    $('#namefile').css({ "color": "red", "font-weight": 700 });
    $('#namefile').html("File " + filename + " is not  pic!");

    $("#submitbtn").hide();
    $("#fakebtn").show();
  } else {
    //if file is valid we show the green alert and show the valid submit
    $(".imgupload").hide("slow");
    $(".imgupload.stop").hide("slow");
    $(".imgupload.ok").show("slow");

    $('#namefile').css({ "color": "green", "font-weight": 700 });
    $('#namefile').html(filename);

    $("#submitbtn").show();
    $("#fakebtn").hide();
  }
});


// Variable to hold request
var request;

// Bind to the submit event of our form
$("#submitbtn").click(function(event){

    // Prevent default posting of form - put here to work in case of errors
    event.preventDefault();

    // Abort any pending request
    if (request) {
        request.abort();
    }
    // setup some local variables
    var $form = $(this);

    // Let's select and cache all the fields
    var $inputs = $form.find("input, select, button, textarea");

    // Serialize the data in the form
    var serializedData = $form.serialize();

    // Let's disable the inputs for the duration of the Ajax request.
    // Note: we disable elements AFTER the form data has been serialized.
    // Disabled form elements will not be serialized.
    $inputs.prop("disabled", true);



    var settings = {
    "url": "https://vision.googleapis.com/v1/images:annotate?key=AIzaSyC06O_XUzo12goOrLKOOTtczAnXOoGgOiw",
    "method": "POST",
    "timeout": 0,
    "headers": {
        "Content-Type": "application/json"
    },
    "data": JSON.stringify({"requests":[{"image":{"content":imgBase64},"features":[{"maxResults": 50,"type":"LABEL_DETECTION"}]}]}),
    };

 
    // Fire off the request to /form.php
    request = $.ajax(settings);

    // Callback handler that will be called on success
    request.done(function (response, textStatus, jqXHR){
        // Log a message to the console
        //console.log("Hooray, it worked!");
        //console.log(response);
        labelsJson = response.responses[0].labelAnnotations;
        //console.log(labelsJson);
        selecionarTiposOcorrência(labelsJson);
        createTableLabels(labelsJson);
    });

    // Callback handler that will be called on failure
    request.fail(function (jqXHR, textStatus, errorThrown){
        // Log the error to the console
        console.error(
            "The following error occurred: "+
            textStatus, errorThrown
        );
    });

    // Callback handler that will be called regardless
    // if the request failed or succeeded
    request.always(function () {
        // Reenable the inputs
        $inputs.prop("disabled", false);
    });

});



var testeJson = {
      "responses": [
        {
          "labelAnnotations": [
            {
              "mid": "/m/01c8br",
              "description": "Kids Man",
              "score": 0.87294734,
              "topicality": 0.87294734
            },
            {
              "mid": "/m/06pg22",
              "description": "shows",
              "score": 0.8523099,
              "topicality": 0.8523099
            },
            {
              "mid": "/m/0dx1j",
              "description": "VEHICLE",
              "score": 0.8481104,
              "topicality": 0.8481104
            },
            {
              "mid": "/m/01d74z",
              "description": "Night",
              "score": 0.80408716,
              "topicality": 0.80408716
            },
            {
              "mid": "/m/01lwf0",
              "description": "home",
              "score": 0.7133322,
              "topicality": 0.7133322
            }
          ]
        }
      ]
    };
//labelsJson = testeJson.responses[0].labelAnnotations;
//createTableLabels(labelsJson);
//selecionarTiposOcorrência(labelsJson);


//Criar função para fazer ligação dos labels com ocorrências

function selecionarTiposOcorrência(labelsJson){

  //definir tipo de ocorência



  for (var i = 0; i < labelsJson.length; i++) {
    var labelDescricao = labelsJson[i]['description'];
    //console.log(labelDescricao);

    //INCÊNDIO
    if(labelDescricao.toUpperCase().includes('FIRE')
      || labelDescricao.toUpperCase().includes('FLAME')
      || labelDescricao.toUpperCase().includes('HEAT')
      || labelDescricao.toUpperCase().includes('SMOKE')
      || labelDescricao.toUpperCase().includes('EXPLOSION')
      ){
      //console.log(labelDescricao);
      //labelsOcorrencia.push('INCÊNDIO');
      incendio = true;
    }

    //VEGETAÇÃO
    if(labelDescricao.toUpperCase().includes('VEGETATION')
      || labelDescricao.toUpperCase().includes('TREE')
      || labelDescricao.toUpperCase().includes('GRASS')
      || labelDescricao.toUpperCase().includes('NATURE')
      ){
      //console.log(labelDescricao);
      //labelsOcorrencia.push('VEGETAÇÃO');
      incendioVegetacao = true;
    }

    //CARROS
    if(labelDescricao.toUpperCase().includes('VEHICLE')
      || labelDescricao.toUpperCase().includes('TRANSPORT')
      || labelDescricao.toUpperCase().includes('CAR')
      || labelDescricao.toUpperCase().includes('BUS')
      ){
      //console.log(labelDescricao);
      //labelsOcorrencia.push('VEÍCULO');
      incendioVeiculo = true;
    }

    //RESIDENCIA
    if(labelDescricao.toUpperCase().includes('ROOF')
      || labelDescricao.toUpperCase().includes('HOUSE')
      || labelDescricao.toUpperCase().includes('ARCHITECTURE')
      || labelDescricao.toUpperCase().includes('HOME')
      || labelDescricao.toUpperCase().includes('BUILDING')
      || labelDescricao.toUpperCase().includes('RESIDENTIAL')
      || labelDescricao.toUpperCase().includes('FACADE')
      || labelDescricao.toUpperCase().includes('APARTMENT')
      || labelDescricao.toUpperCase().includes('NEIGHBOURHOOD')
      || labelDescricao.toUpperCase().includes('CONDOMINIUM')
      || labelDescricao.toUpperCase().includes('TOWER')
      || labelDescricao.toUpperCase().includes('METROPOLITAN')
      || labelDescricao.toUpperCase().includes('COMMERCIAL')
      || labelDescricao.toUpperCase().includes('CITY')
      || labelDescricao.toUpperCase().includes('METROPOLIS')
      || labelDescricao.toUpperCase().includes('WINDOW')
      ){
      //console.log(labelDescricao);
      //labelsOcorrencia.push('ESTRUTURAL');
      incendioEstrutural = true;
    }
  }


  //console.log(labelsOcorrencia);
  if(!tipoIncendio()){
    console.log('Sua foto não foi aceita. Tente tirar uma foto melhor.');
  }
}


//função para confirmar ocorrência
//verificar se imagem foi retirada da WEB
//verificar objetos na cena


//função para definir tipo de ocorrência
function tipoIncendio(){
  if(incendio){
    if(incendioEstrutural){
      console.log('Ocorrência confirmada de incêndio em estruturas.');
      return true;
    }
    if(incendioVegetacao){
      console.log('Ocorrência confirmada de incêndio em vegetação.');
      return true;
    }
    if(incendioVeiculo){
      console.log('Ocorrência confirmada de incêndio em veículo');
      return true;
    }
    return false;
    
  }
}


function createTableLabels(labelAnnotations){
 
    //console.log('Tamanho array: '+ labelAnnotations.length);
    let conteudo = `<table class="table">
        <thead>
            <tr>
            <th scope="col">#</th>
            <th scope="col">Descrição</th>
            <th scope="col">Pontuação</th>
            </tr>
        </thead>
        <tbody>`;

    for (var i = 0; i < labelAnnotations.length; i++) {
        // more statements
        conteudo +=`
          <tr>
          <th scope="row">`+i+`</th>
          <td>`+labelAnnotations[i]['description']+`</td>
          <td>`+labelAnnotations[i]['score']+`</td>
          </tr>`;
    }
    conteudo +=`
        </tbody>
        </table>`;
    $('.btn-container').html(conteudo);
}



//# sourceURL=pen.js
//https://codepen.io/emiemi/details/zxNXWR