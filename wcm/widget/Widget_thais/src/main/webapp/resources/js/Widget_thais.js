var MyWidget = SuperWidget.extend({
    // Variáveis da widget
    variavelNumerica: null,
    variavelCaracter: null,

    // Método iniciado quando a widget é carregada
    init: function() {
    },
  
    // BIND de eventos
    bindings: {
        local: {
            'chamarEvento1': ['click_minhaFuncao1'],
            'chamarEvento2': ['dblclick_minhaFuncao2'],
            'chamarEvento3': ['mouseover_minhaFuncao3'],
        },
        global: {}
    },
 
    minhaFuncao1: function() {
        console.log("Botão 1 clicado!");
    },

    minhaFuncao2: function() {
        console.log("Cliquei duas vezes no botão 2");
    },

    minhaFuncao3: function() {
        console.log("Passei o mouse por cima do botão 3");
    }

});