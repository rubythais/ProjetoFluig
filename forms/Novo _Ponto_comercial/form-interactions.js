$(document).ready(function() {
    // ========== FUNCIONALIDADES DE TABELA ==========
    
    // Atualizar tabela quando tipo de ponto muda
    $('input[name="tipoPonto"]').on('change', function() {
        var tipoPonto = $(this).val();
        var tipoFormatado = tipoPonto.charAt(0).toUpperCase() + tipoPonto.slice(1);
        $('#tipoPontoExibicao').text(tipoFormatado).removeClass('text-muted').addClass('text-primary');
    });

    // Atualizar dias de funcionamento na tabela
    function atualizarDias() {
        var dias = [];
        var diasLabels = {
            'domingo': 'Dom',
            'segunda': 'Seg',
            'terca': 'Ter',
            'quarta': 'Qua',
            'quinta': 'Qui',
            'sexta': 'Sex',
            'sabado': 'Sab'
        };

        $.each(diasLabels, function(key, label) {
            if ($('input[name="' + key + '"]').is(':checked')) {
                dias.push(label);
            }
        });

        var diasTexto = dias.length > 0 ? dias.join(', ') : '-';
        var classeTexto = dias.length > 0 ? 'text-success' : 'text-muted';
        
        $('#diasExibicao')
            .text(diasTexto)
            .removeClass('text-muted text-success')
            .addClass(classeTexto);
    }

    // Listeners para checkboxes de dias
    $('input[type="checkbox"][name="domingo"], input[type="checkbox"][name="segunda"], ' +
      'input[type="checkbox"][name="terca"], input[type="checkbox"][name="quarta"], ' +
      'input[type="checkbox"][name="quinta"], input[type="checkbox"][name="sexta"], ' +
      'input[type="checkbox"][name="sabado"]').on('change', function() {
        atualizarDias();
    });

    // ========== EFEITOS VISUAIS ==========
    
    // Hover em linhas da tabela
    $('#infoTable tbody tr').on('mouseenter', function() {
        $(this).addClass('active-row');
    }).on('mouseleave', function() {
        $(this).removeClass('active-row');
    });

    // Estilo de foco para inputs
    $('.form-control').on('focus', function() {
        $(this).closest('.form-group').find('label').addClass('active');
    }).on('blur', function() {
        if ($(this).val() === '') {
            $(this).closest('.form-group').find('label').removeClass('active');
        }
    });

    // ========== VALIDAÇÕES ==========
    
    // Validar email
    $('#email').on('blur', function() {
        var email = $(this).val();
        var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (email && !emailRegex.test(email)) {
            $(this).closest('.form-group').addClass('has-error');
            $(this).after('<span class="help-block">Email inválido</span>');
        } else {
            $(this).closest('.form-group').removeClass('has-error');
            $(this).next('.help-block').remove();
        }
    });

    // ========== MÁSCARAS E FORMATAÇÕES ==========
    
    // Função para aplicar máscara de telefone
    $('#telefone').on('input', function() {
        var telefone = $(this).val().replace(/\D/g, '');
        
        if (telefone.length > 11) {
            telefone = telefone.slice(0, 11);
        }
        
        if (telefone.length >= 0) {
            var parte1 = telefone.slice(0, 2);
            var parte2 = telefone.slice(2, 7);
            var parte3 = telefone.slice(7, 11);
            
            var formatado = '';
            if (parte1) formatado = '(' + parte1;
            if (parte2) formatado += ') ' + parte2;
            if (parte3) formatado += '-' + parte3;
            
            $(this).val(formatado || telefone);
        }
    });

    // Auto-preenchimento de CEP
    $("#cep").on('blur', function () {
        var cep = $(this).val().replace(/\D/g, '');
        
        if (cep.length === 8) {
            $(this).closest('.form-group').addClass('loading');
            $("#logradouro").val("Buscando...");
            
            $.getJSON(
                "https://viacep.com.br/ws/" + cep + "/json/",
                function (dados) {
                    $(this).closest('.form-group').removeClass('loading');
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

    // Inicializar
    atualizarDias();
    carregarMoedasFinanceiro();
});

function carregarMoedasFinanceiro() {
    var $select = $('#moedaFinanceira');

    if (typeof DatasetFactory === 'undefined') {
        $select.html('<option value="">Dataset indisponível</option>');
        return;
    }

    var dataset = DatasetFactory.getDataset('dsMoedas', null, null, null);

    if (!dataset || !dataset.values || dataset.values.length === 0) {
        $select.html('<option value="">Nenhuma moeda encontrada</option>');
        return;
    }

    var options = ['<option value="">Selecione</option>'];
    for (var i = 0; i < dataset.values.length; i++) {
        var item = dataset.values[i];
        var simbolo = item.simbolo || '';
        var nomeMoeda = item.nomeMoeda || '';
        var valor = simbolo ? simbolo : nomeMoeda;
        var texto = simbolo && nomeMoeda ? (simbolo + ' - ' + nomeMoeda) : (simbolo || nomeMoeda);
        options.push('<option value="' + valor + '">' + texto + '</option>');
    }

    $select.html(options.join(''));
}
