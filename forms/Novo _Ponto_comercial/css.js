$(document).ready(function() {
    $("#cep").blur(function () {
        var cep = $(this).val().replace(/\D/g, '');
        
        if (cep.length === 8) {
            $.getJSON(
                "https://viacep.com.br/ws/" + cep + "/json/",
                function (dados) {
                    if (!("erro" in dados)) {
                        $("#logradouro").val(dados.logradouro);
                        $("#bairro").val(dados.bairro);
                        $("#cidade").val(dados.localidade);
                        $("#estado").val(dados.uf);
                    }
                }
            ).fail(function() {
                console.log("Erro ao buscar CEP");
            });
        }
    });
});