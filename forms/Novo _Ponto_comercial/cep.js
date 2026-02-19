$(document).ready(function() {
    // Auto-preenchimento de CEP
    $("#cep").blur(function () {
        var cep = $(this).val().replace(/\D/g, '');
        
        if (cep.length === 8) {
            // Mostra loading
            $("#logradouro").val("Buscando...");
            
            $.getJSON(
                "https://viacep.com.br/ws/" + cep + "/json/",
                function (dados) {
                    if (!("erro" in dados)) {
                        $("#logradouro").val(dados.logradouro);
                        $("#bairro").val(dados.bairro);
                        $("#cidade").val(dados.localidade);
                        $("#estado").val(dados.uf);
                        $("#numero").focus();
                    } else {
                        alert("CEP não encontrado!");
                        limparCamposEndereco();
                    }
                }
            ).fail(function() {
                alert("Erro ao buscar CEP. Verifique sua conexão.");
                limparCamposEndereco();
            });
        }
    });
    
    // Limpar campos de endereço
    function limparCamposEndereco() {
        $("#logradouro").val("");
        $("#bairro").val("");
        $("#cidade").val("");
        $("#estado").val("");
    }
});