/**
 * events.js - Eventos do Processo de Sugestão de Melhoria
 * Notificações por email e lógica de negócio
 */

/**
 * Evento disparado quando tarefa é atribuída
 * @param {Number} colleagueId - ID do colaborador
 * @param {Object} nextState - Próximo estado
 * @param {Number} userPool - Pool de usuários
 */
function beforeTaskCreate(colleagueId, nextState, userPool) {
    var numAtividade = getValue("WKNumState");
    var numProcesso = getValue("WKNumProces");
    var titulo = getValue("sugestao_titulo");
    var tipo = getValue("sugestao_tipo");
    var modulo = getValue("sugestao_modulo");
    var solicitante = getValue("sugestao_solicitante");
    
    log.info("➤ beforeTaskCreate - Atividade: " + numAtividade + " | Colaborador: " + colleagueId);
    
    // Atividade 4: Submeter Sugestão -> Notificar Gestor
    if (numAtividade == 4) {
        try {
            enviarEmailTriagem(colleagueId, numProcesso, titulo, tipo, modulo, solicitante);
        } catch (e) {
            log.error("Erro ao enviar email de triagem: " + e);
        }
    }
    
    // Atividade 5: Revisar Sugestão -> Notificar aprovadores
    if (numAtividade == 5) {
        try {
            enviarEmailRevisao(colleagueId, numProcesso, titulo, tipo, modulo);
        } catch (e) {
            log.error("Erro ao enviar email de revisão: " + e);
        }
    }
    
    // Atividade 9: Implementar -> Notificar time de desenvolvimento  
    if (numAtividade == 9) {
        try {
            enviarEmailImplementacao(colleagueId, numProcesso, titulo, tipo, modulo);
        } catch (e) {
            log.error("Erro ao enviar email de implementação: " + e);
        }
    }
}

/**
 * Evento disparado após movimentação de processo
 */
function afterProcessFinish(processInstanceId) {
    var status = getValue("sugestao_status");
    var titulo = getValue("sugestao_titulo");
    var solicitante = getValue("sugestao_solicitante");
    var justificativa = getValue("sugestao_justificativa");
    
    log.info("➤ afterProcessFinish - Processo: " + processInstanceId + " | Status Final: " + status);
    
    try {
        // Notificar solicitante sobre conclusão
        enviarEmailFinalizacao(processInstanceId, titulo, status, solicitante, justificativa);
    } catch (e) {
        log.error("Erro ao enviar email de finalização: " + e);
    }
}

/**
 * Evento após salvar formulário
 */
function afterSaveValidate(numState) {
    var numProcesso = getValue("WKNumProces");
    var status = getValue("sugestao_status");
    
    log.info("➤ afterSaveValidate - Processo: " + numProcesso + " | Estado: " + numState + " | Status: " + status);
    
    // Atualizar automaticamente o nome do solicitante na primeira vez
    if (numState == 0) {
        var usuarioAtual = fluigAPI.getUserService().getCurrent();
        if (usuarioAtual) {
            hAPI.setCardValue("sugestao_solicitante", usuarioAtual.getFullName());
        }
    }
}

/**
 * Notificação: Nova sugestão em triagem
 */
function enviarEmailTriagem(destinatarioId, numProcesso, titulo, tipo, modulo, solicitante) {
    var assunto = "🔔 Nova Sugestão de Melhoria - " + tipo + " | " + modulo;
    
    var corpo = "<html><body style='font-family: Arial, sans-serif; color: #333;'>";
    corpo += "<div style='max-width: 600px; margin: 0 auto; padding: 20px; border: 2px solid #5bc0de; border-radius: 8px;'>";
    corpo += "<h2 style='color: #5bc0de; border-bottom: 2px solid #5bc0de; padding-bottom: 10px;'>📋 Nova Sugestão de Melhoria</h2>";
    corpo += "<p style='font-size: 14px; line-height: 1.6;'>";
    corpo += "<strong>Processo:</strong> #" + numProcesso + "<br>";
    corpo += "<strong>Título:</strong> " + titulo + "<br>";
    corpo += "<strong>Tipo:</strong> " + tipo + "<br>";
    corpo += "<strong>Módulo/Área:</strong> " + modulo + "<br>";
    corpo += "<strong>Solicitante:</strong> " + solicitante + "<br>";
    corpo += "</p>";
    corpo += "<p style='background: #f0f8ff; padding: 12px; border-left: 4px solid #5bc0de; margin: 15px 0;'>";
    corpo += "Uma nova sugestão foi submetida e aguarda sua revisão.";
    corpo += "</p>";
    corpo += "<div style='text-align: center; margin-top: 20px;'>";
    corpo += "<a href='" + getProcessUrl(numProcesso) + "' style='display: inline-block; padding: 12px 24px; background: #5bc0de; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;'>Revisar Agora</a>";
    corpo += "</div>";
    corpo += "</div></body></html>";
    
    notificadorEmail.send(destinatarioId, assunto, corpo, "html");
    log.info("✅ Email de triagem enviado para: " + destinatarioId);
}

/**
 * Notificação: Sugestão em revisão
 */
function enviarEmailRevisao(destinatarioId, numProcesso, titulo, tipo, modulo) {
    var assunto = "🔍 Sugestão Aguardando Revisão - " + titulo;
    
    var corpo = "<html><body style='font-family: Arial, sans-serif; color: #333;'>";
    corpo += "<div style='max-width: 600px; margin: 0 auto; padding: 20px; border: 2px solid #f0ad4e; border-radius: 8px;'>";
    corpo += "<h2 style='color: #f0ad4e; border-bottom: 2px solid #f0ad4e; padding-bottom: 10px;'>🔍 Revisão Necessária</h2>";
    corpo += "<p style='font-size: 14px; line-height: 1.6;'>";
    corpo += "<strong>Processo:</strong> #" + numProcesso + "<br>";
    corpo += "<strong>Título:</strong> " + titulo + "<br>";
    corpo += "<strong>Tipo:</strong> " + tipo + "<br>";
    corpo += "<strong>Módulo:</strong> " + modulo + "<br>";
    corpo += "</p>";
    corpo += "<p style='background: #fff8e1; padding: 12px; border-left: 4px solid #f0ad4e; margin: 15px 0;'>";
    corpo += "Esta sugestão aguarda sua análise e decisão (Aprovar/Rejeitar/Backlog).";
    corpo += "</p>";
    corpo += "<div style='text-align: center; margin-top: 20px;'>";
    corpo += "<a href='" + getProcessUrl(numProcesso) + "' style='display: inline-block; padding: 12px 24px; background: #f0ad4e; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;'>Analisar Sugestão</a>";
    corpo += "</div>";
    corpo += "</div></body></html>";
    
    notificadorEmail.send(destinatarioId, assunto, corpo, "html");
    log.info("✅ Email de revisão enviado para: " + destinatarioId);
}

/**
 * Notificação: Sugestão aprovada para implementação
 */
function enviarEmailImplementacao(destinatarioId, numProcesso, titulo, tipo, modulo) {
    var assunto = "✅ Sugestão Aprovada - Iniciar Implementação: " + titulo;
    
    var corpo = "<html><body style='font-family: Arial, sans-serif; color: #333;'>";
    corpo += "<div style='max-width: 600px; margin: 0 auto; padding: 20px; border: 2px solid #5cb85c; border-radius: 8px;'>";
    corpo += "<h2 style='color: #5cb85c; border-bottom: 2px solid #5cb85c; padding-bottom: 10px;'>✅ Sugestão Aprovada</h2>";
    corpo += "<p style='font-size: 14px; line-height: 1.6;'>";
    corpo += "<strong>Processo:</strong> #" + numProcesso + "<br>";
    corpo += "<strong>Título:</strong> " + titulo + "<br>";
    corpo += "<strong>Tipo:</strong> " + tipo + "<br>";
    corpo += "<strong>Módulo:</strong> " + modulo + "<br>";
    corpo += "</p>";
    corpo += "<p style='background: #e8f5e9; padding: 12px; border-left: 4px solid #5cb85c; margin: 15px 0;'>";
    corpo += "🎉 Esta sugestão foi aprovada e atribuída para implementação. Inicie o desenvolvimento conforme a descrição e requisitos.";
    corpo += "</p>";
    corpo += "<div style='text-align: center; margin-top: 20px;'>";
    corpo += "<a href='" + getProcessUrl(numProcesso) + "' style='display: inline-block; padding: 12px 24px; background: #5cb85c; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;'>Ver Detalhes</a>";
    corpo += "</div>";
    corpo += "</div></body></html>";
    
    notificadorEmail.send(destinatarioId, assunto, corpo, "html");
    log.info("✅ Email de implementação enviado para: " + destinatarioId);
}

/**
 * Notificação: Processo finalizado
 */
function enviarEmailFinalizacao(numProcesso, titulo, statusFinal, solicitante, justificativa) {
    var assunto = statusFinal === "reprovado" 
        ? "❌ Sugestão Reprovada - " + titulo 
        : "✅ Sugestão Concluída - " + titulo;
    
    var corBorda = statusFinal === "reprovado" ? "#d9534f" : "#5cb85c";
    var corTitulo = statusFinal === "reprovado" ? "#d9534f" : "#5cb85c";
    var icone = statusFinal === "reprovado" ? "❌" : "✅";
    var mensagem = statusFinal === "reprovado" 
        ? "Sua sugestão foi analisada e, infelizmente, não será implementada no momento." 
        : "Sua sugestão foi implementada com sucesso! 🎉";
    
    var corpo = "<html><body style='font-family: Arial, sans-serif; color: #333;'>";
    corpo += "<div style='max-width: 600px; margin: 0 auto; padding: 20px; border: 2px solid " + corBorda + "; border-radius: 8px;'>";
    corpo += "<h2 style='color: " + corTitulo + "; border-bottom: 2px solid " + corBorda + "; padding-bottom: 10px;'>" + icone + " Processo Finalizado</h2>";
    corpo += "<p style='font-size: 14px; line-height: 1.6;'>";
    corpo += "<strong>Processo:</strong> #" + numProcesso + "<br>";
    corpo += "<strong>Título:</strong> " + titulo + "<br>";
    corpo += "<strong>Status Final:</strong> " + statusFinal.toUpperCase() + "<br>";
    corpo += "</p>";
    corpo += "<p style='background: #f5f5f5; padding: 12px; border-left: 4px solid " + corBorda + "; margin: 15px 0;'>";
    corpo += mensagem;
    corpo += "</p>";
    
    if (justificativa && justificativa.trim() !== "") {
        corpo += "<div style='margin: 15px 0; padding: 12px; background: #fafafa; border-radius: 4px;'>";
        corpo += "<strong>Justificativa:</strong><br>";
        corpo += justificativa;
        corpo += "</div>";
    }
    
    corpo += "<p style='font-size: 12px; color: #666; margin-top: 20px;'>Obrigado por contribuir com melhorias!</p>";
    corpo += "</div></body></html>";
    
    // Tentar enviar para solicitante
    try {
        var usuarioSolicitante = fluigAPI.getUserService().findByLogin(solicitante);
        if (usuarioSolicitante) {
            notificadorEmail.send(usuarioSolicitante.getColleagueId(), assunto, corpo, "html");
            log.info("✅ Email de finalização enviado para: " + solicitante);
        }
    } catch (e) {
        log.error("Erro ao enviar email de finalização: " + e);
    }
}

/**
 * Monta URL do processo
 */
function getProcessUrl(numProcesso) {
    var baseUrl = fluigAPI.getEnvironmentVariable("FLUIG_URL") || "http://localhost:8080";
    return baseUrl + "/portal/p/1/processInstanceTasksView?processInstanceId=" + numProcesso;
}

/**
 * Helper: Verificar se campo foi modificado
 */
function fieldChanged(fieldName) {
    try {
        var oldValue = hAPI.getCardValue(fieldName);
        var newValue = getValue(fieldName);
        return oldValue !== newValue;
    } catch (e) {
        return false;
    }
}
