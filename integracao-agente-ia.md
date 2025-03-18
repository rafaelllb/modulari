# Documento de Integração
# Agente de IA Conversacional no Modulari

**Versão:** 1.0  
**Data:** 18/03/2025  
**Classificação:** Confidencial  
**Autor:** Equipe Modulari  

---

## Sumário Executivo

Este documento apresenta o planejamento detalhado para integração de um agente de IA conversacional ao projeto Modulari, mantendo a estrutura principal do sistema existente. A inovação central consiste em adicionar uma interface conversacional que coexistirá com o questionário estruturado atual, permitindo ao usuário escolher seu método preferido de interação. O objetivo primário é coletar dados do usuário de forma mais natural e aplicar técnicas avançadas de persuasão e venda para melhorar as taxas de conversão.

---

## 1. Visão Geral do Projeto

### 1.1 Situação Atual

O projeto Modulari atualmente utiliza um questionário estruturado (discovery.html) para coletar preferências dos usuários e recomendar imóveis compatíveis. Este método, embora eficaz, pode ser percebido como mecânico e impessoal por alguns usuários.

### 1.2 Proposta de Integração

Implementar um agente de IA conversacional que:
- Apareça como opção alternativa na página principal
- Substitua a visualização do questionário discovery quando selecionado
- Colete informações do usuário através de diálogo natural
- Utilize técnicas de persuasão e venda para melhorar conversões
- Alimente o mesmo sistema de recomendação existente

### 1.3 Objetivos

1. Aumentar o engajamento do usuário através de interação mais natural
2. Coletar dados de forma imperceptível e não intrusiva
3. Aplicar técnicas de venda e persuasão customizadas para cada perfil
4. Incrementar a taxa de conversão em pelo menos 20%
5. Manter compatibilidade com o sistema existente

---

## 2. Arquitetura e Integração

### 2.1 Visão Geral da Arquitetura

![Diagrama de Arquitetura](diagrama-arquitetura.png)

O sistema utiliza uma arquitetura modular onde o agente de IA será integrado como um componente paralelo ao questionário discovery, compartilhando o mesmo backend de dados e recomendações.

### 2.2 Componentes Principais

| Componente | Tipo | Descrição | Status |
|------------|------|-----------|--------|
| Interface Principal | Frontend | Página inicial com opção de escolha entre agente e questionário | Adaptação |
| Agente de IA | Frontend/Backend | Sistema conversacional com processamento de linguagem natural | Novo |
| Extrator de Preferências | Backend | Converte conversas em preferências estruturadas | Novo |
| Motor de Persuasão | Backend | Implementa estratégias de venda e persuasão | Novo |
| Sistema de Matchmaking | Backend | Motor de recomendação de imóveis | Existente |
| Serviço de Dados | Backend | Gerenciamento de perfis e preferências | Adaptação |

### 2.3 Fluxo de Dados

1. O usuário acessa a página inicial e escolhe entre o agente de IA ou questionário
2. Se escolher o agente, a visualização do questionário é substituída pela interface de chat
3. As mensagens do usuário são processadas pelo sistema de NLP
4. As preferências extraídas são convertidas ao formato compatível com o DataService
5. O sistema de matchmaking utiliza as preferências para recomendar imóveis
6. O motor de persuasão determina as próximas etapas da conversa
7. Imóveis recomendados são apresentados contextualmente na conversa

---

## 3. Modificações na Interface do Usuário

### 3.1 Página Inicial (index.html)

A página inicial será adaptada para incluir uma opção de escolha entre os dois métodos de interação:

```html
<!-- Nova seção na página inicial após hero-section -->
<div class="interaction-choice">
    <h3 class="section-title">Como você prefere encontrar seu imóvel ideal?</h3>
    
    <div class="choice-cards">
        <div class="choice-card" id="discovery-option" onclick="selectInteractionMode('discovery')">
            <div class="choice-icon">📋</div>
            <h4>Questionário Guiado</h4>
            <p>Responda a perguntas específicas para encontrar seu imóvel ideal rapidamente.</p>
            <button class="button button-primary">Começar Questionário</button>
        </div>
        
        <div class="choice-card highlighted" id="conversation-option" onclick="selectInteractionMode('conversation')">
            <div class="choice-icon">💬</div>
            <h4>Converse com Nosso Assistente</h4>
            <p>Deixe nosso assistente inteligente entender suas necessidades através de uma conversa natural.</p>
            <button class="button button-primary">Iniciar Conversa</button>
        </div>
    </div>
</div>
```

### 3.2 Container de Interação

Será criado um container dinâmico para abrigar tanto o questionário quanto o agente:

```html
<!-- Container de interação dinâmico -->
<div id="interaction-container" class="interaction-container">
    <!-- O conteúdo será carregado dinamicamente baseado na escolha -->
</div>
```

### 3.3 Interface do Agente Conversacional

Nova interface de chat a ser carregada no container de interação:

```html
<!-- Template do chat que será injetado no container -->
<div class="conversation-interface">
    <div class="conversation-sidebar">
        <!-- Progresso da conversa -->
        <div class="progress-panel">
            <h3>Seu progresso</h3>
            <div class="progress-items" id="progress-items">
                <!-- Itens de progresso serão adicionados dinamicamente -->
            </div>
        </div>
        
        <!-- Resumo de preferências identificadas -->
        <div class="preferences-panel">
            <h3>Preferências identificadas</h3>
            <div id="identified-preferences">
                <!-- Preferências identificadas serão adicionadas dinamicamente -->
            </div>
        </div>
        
        <!-- Opção para mudar para questionário -->
        <div class="switch-mode">
            <button class="button button-secondary" onclick="switchToDiscovery()">
                Alternar para questionário
            </button>
        </div>
    </div>
    
    <div class="conversation-main">
        <div class="chat-messages" id="chat-messages">
            <!-- Mensagens serão inseridas aqui -->
        </div>
        
        <div class="properties-preview" id="properties-preview">
            <!-- Imóveis recomendados serão mostrados aqui -->
        </div>
        
        <div class="chat-input">
            <input type="text" id="user-input" placeholder="Digite sua mensagem...">
            <button id="send-button" class="button button-primary">Enviar</button>
        </div>
    </div>
</div>
```

### 3.4 Estilos CSS

Serão necessários novos estilos CSS para a interface de conversação:

```css
/* Estilos para o container de seleção de modo */
.interaction-choice {
    margin: var(--spacing-lg) 0;
    text-align: center;
}

.choice-cards {
    display: flex;
    gap: var(--spacing-md);
    margin-top: var(--spacing-md);
    flex-wrap: wrap;
    justify-content: center;
}

.choice-card {
    background: var(--surface);
    border-radius: var(--radius-lg);
    padding: var(--spacing-lg);
    width: 300px;
    box-shadow: var(--shadow-sm);
    transition: transform 0.2s, box-shadow 0.2s;
    cursor: pointer;
    text-align: center;
}

.choice-card:hover, .choice-card.highlighted {
    transform: translateY(-4px);
    box-shadow: var(--shadow-md);
}

.choice-card.highlighted {
    border: 2px solid var(--primary);
}

.choice-icon {
    font-size: 2.5rem;
    margin-bottom: var(--spacing-md);
    color: var(--primary);
}

/* Estilos para a interface de conversação */
.conversation-interface {
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: var(--spacing-md);
    background: var(--surface);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md);
    overflow: hidden;
}

.conversation-sidebar {
    background: var(--surface-alt);
    padding: var(--spacing-md);
    border-right: 1px solid var(--border);
}

.conversation-main {
    display: flex;
    flex-direction: column;
    height: 600px;
}

.chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: var(--spacing-md);
}

.chat-input {
    display: flex;
    gap: var(--spacing-xs);
    padding: var(--spacing-md);
    border-top: 1px solid var(--border);
}

.chat-input input {
    flex: 1;
    padding: var(--spacing-sm);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
}

.chat-message {
    margin-bottom: var(--spacing-md);
    max-width: 80%;
}

.chat-message.user {
    margin-left: auto;
    background: var(--primary-light);
    color: var(--surface);
    border-radius: var(--radius-md) var(--radius-md) 0 var(--radius-md);
    padding: var(--spacing-sm) var(--spacing-md);
}

.chat-message.assistant {
    margin-right: auto;
    background: var(--surface-alt);
    border-radius: var(--radius-md) var(--radius-md) var(--radius-md) 0;
    padding: var(--spacing-sm) var(--spacing-md);
}

.properties-preview {
    display: flex;
    gap: var(--spacing-sm);
    overflow-x: auto;
    padding: var(--spacing-sm);
    border-top: 1px solid var(--border);
}

/* Responsividade */
@media (max-width: 768px) {
    .conversation-interface {
        grid-template-columns: 1fr;
    }
    
    .conversation-sidebar {
        display: none;
    }
}
```

---

## 4. Novos Componentes de Software

### 4.1 Serviço de Conversação (conversation-service.js)

Este novo módulo será responsável por gerenciar o fluxo de diálogo, processar mensagens e coordenar os diferentes componentes do sistema conversacional.

```javascript
/**
 * Serviço de Conversação
 * Responsável por gerenciar o fluxo de diálogo com o usuário
 */
class ConversationService {
  constructor() {
    this.sessionKey = 'conversationSession';
    this.maxHistoryLength = 20;
    this.nlpProcessor = new NLPProcessor();
    this.preferenceExtractor = new PreferenceExtractor();
    this.persuasionEngine = new PersuasionEngine();
  }

  /**
   * Inicia uma nova conversa ou continua uma existente
   * @returns {Object} Estado inicial da conversa
   */
  initConversation() {
    // Verificar se já existe uma sessão
    const existingSession = this.getSession();
    if (existingSession) {
      return existingSession;
    }
    
    // Criar nova sessão
    const session = {
      id: this.generateSessionId(),
      startedAt: new Date().toISOString(),
      messages: [],
      context: {
        currentTopic: 'greeting',
        identifiedPreferences: {},
        confidenceScores: {},
        persuasionStrategy: 'discovery',
        interactionStage: 'initial'
      }
    };
    
    this.saveSession(session);
    
    // Gerar mensagem inicial
    const initialMessage = this.getInitialMessage();
    this.addMessage(session.id, 'assistant', initialMessage);
    
    return session;
  }

  /**
   * Processa uma mensagem do usuário e gera uma resposta
   * @param {string} sessionId - ID da sessão de conversa
   * @param {string} message - Mensagem do usuário
   * @returns {Object} Resposta e ações sugeridas
   */
  async processMessage(sessionId, message) {
    const session = this.getSession(sessionId);
    if (!session) {
      throw new Error('Sessão não encontrada');
    }
    
    // Adicionar mensagem do usuário ao histórico
    this.addMessage(sessionId, 'user', message);
    
    // Analisar a mensagem com NLP
    const analysis = await this.nlpProcessor.analyze(message, session.context);
    
    // Extrair preferências
    const extractedPreferences = this.preferenceExtractor.extract(analysis, session.context);
    
    // Atualizar o contexto
    const updatedContext = this.updateContext(session.context, analysis, extractedPreferences);
    
    // Salvar o contexto atualizado
    session.context = updatedContext;
    this.saveSession(session);
    
    // Exportar preferências para o data-service
    this.exportPreferencesToProfile(sessionId, extractedPreferences);
    
    // Determinar próxima ação com base na estratégia de persuasão
    const nextAction = this.persuasionEngine.determineNextAction(updatedContext);
    
    // Gerar resposta
    const response = this.generateResponse(updatedContext, nextAction);
    
    // Adicionar resposta ao histórico
    this.addMessage(sessionId, 'assistant', response.message);
    
    return {
      message: response.message,
      suggestedProperties: response.suggestedProperties,
      nextActions: response.nextActions,
      identifiedPreferences: this.getIdentifiedPreferences(sessionId)
    };
  }

  /* Métodos auxiliares omitidos para brevidade */
}
```

### 4.2 Processador de NLP (nlp-processor.js)

Este módulo será responsável pelo processamento de linguagem natural, análise de intenções e extração de entidades das mensagens do usuário.

```javascript
/**
 * Processador de Linguagem Natural
 * Responsável por analisar intenções, entidades e sentimentos do usuário
 */
class NLPProcessor {
  constructor() {
    // Inicializar modelo de NLP ou conexão com API externa
    this.setupNLPEngine();
  }

  /**
   * Configura o mecanismo de NLP
   * Pode ser local ou externo (API)
   */
  setupNLPEngine() {
    // Se usando serviço externo como Dialogflow, configurar cliente
    // Se local, carregar modelos
    this.model = {
      // Configurações de conexão
    };
  }

  /**
   * Analisa uma mensagem do usuário
   * @param {string} message - Mensagem do usuário
   * @param {Object} context - Contexto atual da conversa
   * @returns {Object} Análise com intenções, entidades e sentimentos
   */
  async analyze(message, context) {
    try {
      // Análise de intenção (o que o usuário quer)
      const intent = await this.detectIntent(message, context);
      
      // Extração de entidades (dados específicos na mensagem)
      const entities = await this.extractEntities(message);
      
      // Análise de sentimento (positivo, negativo, neutro)
      const sentiment = await this.analyzeSentiment(message);
      
      // Detecção de objeções ou preocupações
      const concerns = await this.detectConcerns(message);
      
      return {
        intent,
        entities,
        sentiment,
        concerns,
        rawText: message
      };
    } catch (error) {
      console.error('Erro ao analisar mensagem:', error);
      return {
        intent: { name: 'fallback', confidence: 1.0 },
        entities: [],
        sentiment: { score: 0, magnitude: 0 },
        concerns: [],
        rawText: message
      };
    }
  }

  /* Implementações específicas de cada método de análise */
}
```

### 4.3 Extrator de Preferências (preference-extractor.js)

Este módulo será responsável por converter a análise de NLP em preferências estruturadas compatíveis com o sistema existente.

```javascript
/**
 * Extrator de Preferências
 * Converte análise de NLP em preferências estruturadas
 */
class PreferenceExtractor {
  constructor() {
    this.preferenceMap = {
      // Mapeamento de entidades para campos de preferência
      'localidade': 'location',
      'preco': 'priceRange',
      'tipo_propriedade': 'propertyType',
      // Outros mapeamentos...
    };
    
    this.confidenceThresholds = {
      direct: 0.9,    // "Quero uma casa com 3 quartos"
      indirect: 0.7,  // "Uma família grande precisa de bastante espaço"
      inferred: 0.5   // Baseado em outras preferências
    };
  }

  /**
   * Extrai preferências da análise de NLP
   * @param {Object} analysis - Análise de NLP
   * @param {Object} context - Contexto atual da conversa
   * @returns {Object} Preferências extraídas com níveis de confiança
   */
  extract(analysis, context) {
    const preferences = {};
    const confidenceScores = {};
    
    // Extrair de entidades explícitas
    this.extractFromEntities(analysis.entities, preferences, confidenceScores);
    
    // Extrair de contexto implícito
    this.extractFromContext(analysis, context, preferences, confidenceScores);
    
    // Inferir preferências adicionais
    this.inferAdditionalPreferences(preferences, confidenceScores, context);
    
    return {
      preferences,
      confidenceScores
    };
  }

  /* Métodos de extração omitidos para brevidade */
}
```

### 4.4 Motor de Persuasão (persuasion-engine.js)

Este módulo será responsável por implementar estratégias de venda e persuasão, adaptando-se ao perfil do usuário e ao contexto da conversa.

```javascript
/**
 * Motor de Persuasão
 * Implementa técnicas de venda e persuasão
 */
class PersuasionEngine {
  constructor() {
    this.persuasionStrategies = {
      discovery: this.discoveryStrategy,
      social_proof: this.socialProofStrategy,
      scarcity: this.scarcityStrategy,
      problem_solution: this.problemSolutionStrategy,
      // Outras estratégias...
    };
    
    this.conversationFlows = {
      initial: {
        nextStages: ['need_assessment', 'property_showcase'],
        strategies: ['discovery']
      },
      need_assessment: {
        nextStages: ['objection_handling', 'property_showcase'],
        strategies: ['discovery', 'problem_solution']
      },
      // Outros estágios...
    };
  }

  /**
   * Determina a próxima ação com base no contexto
   * @param {Object} context - Contexto atual da conversa
   * @returns {Object} Próxima ação recomendada
   */
  determineNextAction(context) {
    const currentStage = context.interactionStage;
    const currentFlow = this.conversationFlows[currentStage];
    
    // Selecionar próximo estágio
    const nextStage = this.selectNextStage(currentFlow, context);
    
    // Selecionar estratégia de persuasão
    const strategy = this.selectStrategy(currentFlow, context);
    
    // Aplicar estratégia selecionada
    const action = this.persuasionStrategies[strategy](context, nextStage);
    
    return {
      ...action,
      strategy,
      targetStage: nextStage
    };
  }

  /* Implementações das estratégias específicas */
}
```

### 4.5 Adaptações no Data Service (data-service.js)

O serviço de dados existente será adaptado para trabalhar com preferências parciais e incrementais:

```javascript
// Adicionar ao DataService existente

/**
 * Atualiza preferências de forma incremental
 * @param {string} profileId - ID do perfil
 * @param {Object} partialPreferences - Preferências parciais
 * @param {Object} confidenceScores - Níveis de confiança para cada preferência
 * @returns {Object} Perfil atualizado
 */
updatePreferencesIncremental(profileId, partialPreferences, confidenceScores) {
  const profile = this.getSearchProfileById(profileId);
  
  if (!profile) {
    return null;
  }
  
  // Inicializar preferências se não existirem
  if (!profile.preferences) {
    profile.preferences = {};
  }
  
  // Inicializar scores de confiança se não existirem
  if (!profile.confidenceScores) {
    profile.confidenceScores = {};
  }
  
  // Atualizar apenas preferências fornecidas
  for (const [key, value] of Object.entries(partialPreferences)) {
    const currentConfidence = profile.confidenceScores[key] || 0;
    const newConfidence = confidenceScores[key] || 0;
    
    // Atualizar apenas se a nova confiança for maior
    if (newConfidence > currentConfidence) {
      profile.preferences[key] = value;
      profile.confidenceScores[key] = newConfidence;
    }
  }
  
  // Salvar perfil atualizado
  this.updateSearchProfile(profileId, {
    preferences: profile.preferences,
    confidenceScores: profile.confidenceScores,
    updatedAt: new Date().toISOString()
  });
  
  return profile;
}

/**
 * Calcula o matchmaking com confiança ponderada
 * @param {Object} property - Propriedade a avaliar
 * @param {Object} preferences - Preferências do usuário
 * @param {Object} confidenceScores - Níveis de confiança
 * @returns {number} Score de match ponderado
 */
calculateMatchScoreWeighted(property, preferences, confidenceScores) {
  // Implementar versão ponderada do algoritmo
  // que considera níveis de confiança para cada preferência
  
  // Código atual adaptado...
}
```

---

## 5. Modificações no JavaScript Existente

### 5.1 Alterações em index.js

```javascript
// Adicionar à lógica de inicialização da página

/**
 * Inicializa a página principal
 */
document.addEventListener('DOMContentLoaded', function() {
  // Código existente...
  
  // Detectar modo preferido (se já tiver usado o sistema)
  const preferredMode = localStorage.getItem('preferredInteractionMode') || 'discovery';
  
  // Inicializar interface com o modo preferido
  selectInteractionMode(preferredMode);
});

/**
 * Seleciona o modo de interação
 * @param {string} mode - 'discovery' ou 'conversation'
 */
window.selectInteractionMode = function(mode) {
  const container = document.getElementById('interaction-container');
  const discoveryOption = document.getElementById('discovery-option');
  const conversationOption = document.getElementById('conversation-option');
  
  // Destacar opção selecionada
  if (mode === 'conversation') {
    conversationOption.classList.add('highlighted');
    discoveryOption.classList.remove('highlighted');
    
    // Inicializar interface de conversa
    initConversationInterface(container);
  } else {
    discoveryOption.classList.add('highlighted');
    conversationOption.classList.remove('highlighted');
    
    // Inicializar questionário discovery
    initDiscoveryInterface(container);
  }
  
  // Salvar preferência do usuário
  localStorage.setItem('preferredInteractionMode', mode);
};

/**
 * Inicializa a interface de conversa
 * @param {HTMLElement} container - Container para injetar interface
 */
function initConversationInterface(container) {
  // Carregar template de conversa
  fetch('templates/conversation-template.html')
    .then(response => response.text())
    .then(template => {
      container.innerHTML = template;
      
      // Inicializar serviço de conversa
      const conversationService = new ConversationService();
      const session = conversationService.initConversation();
      
      // Configurar manipuladores de eventos
      setupConversationEventHandlers(conversationService, session);
      
      // Mostrar mensagem inicial
      displayInitialMessage();
    })
    .catch(error => {
      console.error('Erro ao carregar template de conversa:', error);
      // Fallback para questionário em caso de erro
      initDiscoveryInterface(container);
    });
}

/**
 * Inicializa a interface do questionário discovery
 * @param {HTMLElement} container - Container para injetar interface
 */
function initDiscoveryInterface(container) {
  // Código existente para carregar o questionário discovery
}
```

### 5.2 Novo Arquivo: conversation-ui.js

```javascript
/**
 * Manipuladores de eventos para a interface de conversa
 * @param {ConversationService} service - Serviço de conversa
 * @param {Object} session - Sessão atual
 */
function setupConversationEventHandlers(service, session) {
  const inputField = document.getElementById('user-input');
  const sendButton = document.getElementById('send-button');
  
  // Enviar mensagem ao clicar no botão
  sendButton.addEventListener('click', () => {
    const message = inputField.value.trim();
    if (message) {
      sendUserMessage(service, session.id, message);
      inputField.value = '';
    }
  });
  
  // Enviar mensagem ao pressionar Enter
  inputField.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const message = inputField.value.trim();
      if (message) {
        sendUserMessage(service, session.id, message);
        inputField.value = '';
      }
    }
  });
}

/**
 * Envia mensagem do usuário e processa resposta
 * @param {ConversationService} service - Serviço de conversa
 * @param {string} sessionId - ID da sessão
 * @param {string} message - Mensagem do usuário
 */
async function sendUserMessage(service, sessionId, message) {
  // Mostrar mensagem do usuário
  displayUserMessage(message);
  
  try {
    // Processar mensagem
    const response = await service.processMessage(sessionId, message);
    
    // Mostrar resposta do assistente
    displayAssistantMessage(response.message);
    
    // Mostrar propriedades recomendadas se houver
    if (response.suggestedProperties && response.suggestedProperties.length > 0) {
      displayPropertySuggestions(response.suggestedProperties);
    }
    
    // Atualizar preferências identificadas
    updateIdentifiedPreferences(response.identifiedPreferences);
    
  } catch (error) {
    console.error('Erro ao processar mensagem:', error);
    displayAssistantMessage("Desculpe, tive um problema ao processar sua mensagem. Poderia tentar novamente?");
  }
}

/**
 * Exibe mensagem do usuário na interface
 * @param {string} message - Mensagem do usuário
 */
function displayUserMessage(message) {
  const messagesContainer = document.getElementById('chat-messages');
  const messageElement = document.createElement('div');
  
  messageElement.className = 'chat-message user';
  messageElement.textContent = message;
  
  messagesContainer.appendChild(messageElement);
  scrollToBottom(messagesContainer);
}

/**
 * Exibe mensagem do assistente na interface
 * @param {string} message - Mensagem do assistente
 */
function displayAssistantMessage(message) {
  const messagesContainer = document.getElementById('chat-messages');
  const messageElement = document.createElement('div');
  
  messageElement.className = 'chat-message assistant';
  messageElement.textContent = message;
  
  messagesContainer.appendChild(messageElement);
  scrollToBottom(messagesContainer);
}

/* Outras funções de manipulação da UI */
```

---

## 6. Cronograma de Implementação

### 6.1 Visão Geral das Fases

| Fase | Duração | Descrição |
|------|---------|-----------|
| 1 - Preparação | 2 semanas | Adaptação da arquitetura, design da interface e planejamento detalhado |
| 2 - Desenvolvimento Inicial | 4 semanas | Implementação da infraestrutura básica e fluxos de conversa fundamentais |
| 3 - Inteligência Avançada | 6 semanas | Implementação do processamento de linguagem, extração de preferências e persuasão |
| 4 - Integração | 2 semanas | Integração com o sistema de dados existente e testes de compatibilidade |
| 5 - Testes e Otimização | 4 semanas | Testes com usuários, refinamento de fluxos e otimização de taxas de conversão |
| 6 - Lançamento | 2 semanas | Implantação gradual e monitoramento intensivo |

### 6.2 Marcos e Entregáveis

| Marco | Data Prevista | Entregáveis |
|-------|--------------|-------------|
| M1 - Arquitetura finalizada | Semana 2 | Documento de arquitetura detalhado, protótipos de UI |
| M2 - MVP conversacional | Semana 6 | Interface básica de conversa integrada à página principal |
| M3 - Integração NLP | Semana 10 | Sistema de processamento de linguagem e extração de preferências |
| M4 - Estratégias de persuasão | Semana 14 | Motor de persuasão com estratégias implementadas |
| M5 - Sistema completo integrado | Semana 16 | Integração completa com o sistema existente |
| M6 - Versão otimizada | Semana 18 | Sistema otimizado com base em testes reais |
| M7 - Lançamento geral | Semana 20 | Disponibilização para 100% dos usuários |

---

## 7. Recursos e Tecnologias

### 7.1 Recursos Humanos

| Função | Quantidade | Responsabilidades |
|--------|------------|-------------------|
| Desenvolvedor Frontend | 2 | Implementação da interface do agente |
| Desenvolvedor Backend | 2 | Implementação do serviço de conversa e integrações |
| Especialista em NLP | 1 | Configuração e otimização do processamento de linguagem |
| UX Designer | 1 | Design da interface conversacional |
| Analista de QA | 1 | Testes e garantia de qualidade |
| Gestor de Projeto | 1 | Coordenação e acompanhamento |
| Especialista em Vendas Imobiliárias | 1 (part-time) | Consultoria em estratégias de persuasão |

### 7.2 Tecnologias Recomendadas

| Tipo | Tecnologia | Justificativa |
|------|------------|--------------|
| Frontend | Vanilla JS + Módulos ES6 | Manter consistência com o projeto atual |
| Backend | Node.js + Express | Consistente com a estrutura existente |
| NLP | DialogFlow (Google) | Bom suporte ao português BR, fácil integração |
| Armazenamento | LocalStorage + SessionStorage | Evitar cookies, manter dados de sessão |
| Persistência (servidor) | MongoDB | Flexibilidade para dados não estruturados |
| Logging | ELK Stack | Coleta e análise de conversas para otimização |

### 7.3 Integrações Externas

1. **DialogFlow API**:
   - Para processamento de linguagem natural
   - Reconhecimento de intenções e entidades
   - Manejo de contexto de conversa

2. **API de Análise de Sentimento**:
   - Para determinar receptividade do usuário
   - Detectar frustração ou entusiasmo
   - Adaptar estratégias de persuasão

---

## 8. Métricas e Monitoramento

### 8.1 KPIs Principais

| Métrica | Descrição | Meta | Método de Medição |
|---------|-----------|------|-------------------|
| Taxa de Engajamento | % de usuários que iniciam conversa vs. questionário | 50% em 3 meses | Analytics na página |
| Duração da Conversa | Tempo médio de interação com o agente | >3 minutos | Timestamp de mensagens |
| Completude de Perfil | % de campos de preferência extraídos com sucesso | >80% | Análise de perfis |
| Taxa de Conversão | % de conversas que resultam em interesse concreto | +20% vs. questionário | Tracking de eventos |
| Satisfação do Usuário | Avaliação explícita ou implícita da conversa | >4.0/5.0 | Feedback após conversa |

### 8.2 Sistema de Dashboard

Será implementado um dashboard administrativo com:

1. **Métricas Gerais**:
   - Conversas iniciadas vs. completadas
   - Tempo médio de conversa
   - Taxa de conversão global

2. **Análise de Fluxos**:
   - Visualização de caminhos de conversa mais comuns
   - Pontos de abandono frequentes
   - Tópicos mais discutidos

3. **Eficácia de Persuasão**:
   - Comparação entre diferentes estratégias
   - Eficácia em diferentes perfis de usuário
   - Análise de objeções mais comuns

4. **Qualidade da Extração**:
   - Precisão das preferências extraídas
   - Tempo para atingir um perfil utilizável
   - Comparação com o questionário estruturado

---

## 9. Gestão de Riscos

| Risco | Probabilidade | Impacto | Estratégia de Mitigação |
|-------|--------------|---------|-------------------------|
| Extração de preferências imprecisa | Alta | Alto | Implementar confirmações sutis, fallback para questionário |
| Frustração do usuário com respostas irrelevantes | Média | Alto | Monitoramento constante, fluxos de recuperação, opção fácil para mudar para questionário |
| Problemas técnicos com serviço de NLP | Média | Alto | Testes extensivos, plano de contingência com respostas pré-programadas |
| Baixa adoção do agente | Média | Médio | Design atraente, incentivos para experimentar, destaque na UI |
| Incompatibilidade com perfis existentes | Baixa | Alto | Adaptadores bem testados, migração gradual de dados |
| Performance degradada | Média | Médio | Otimização, caching, processamento assíncrono |

---

## 10. Considerações de Lançamento

### 10.1 Estratégia de Rollout

1. **Fase Alpha (2 semanas)**:
   - Disponível apenas para equipe interna
   - Coleta intensiva de feedback sobre usabilidade
   - Refinamento de fluxos de conversa

2. **Fase Beta (3 semanas)**:
   - Disponível para 10% dos usuários novos
   - Monitoramento intensivo de métricas
   - Ajustes rápidos baseados no feedback

3. **Lançamento Gradual (4 semanas)**:
   - Aumento gradual para 25%, 50%, 75% dos usuários
   - Comparação contínua com o questionário
   - Otimização de taxa de conversão

4. **Lançamento Geral (1 semana)**:
   - Disponível para 100% dos usuários
   - Comunicação destacando o novo recurso
   - Suporte reforçado durante o período inicial

### 10.2 Plano de Comunicação

1. **Comunicação Interna**:
   - Treinamento para equipe de suporte
   - Documentação detalhada para time técnico
   - Workshops sobre casos de uso e limitações

2. **Comunicação Externa**:
   - Anúncio no blog da empresa
   - Email marketing para base de usuários
   - Destaque na página inicial
   - Tutorial interativo na primeira utilização

---

## 11. Expansões Futuras

Após a implementação inicial bem-sucedida, as seguintes expansões podem ser consideradas:

1. **Interação por Voz**:
   - Adicionar capacidade de fala para o assistente
   - Reconhecimento de voz para maior naturalidade

2. **Personalização Avançada**:
   - Adaptar tom e estilo de comunicação por perfil
   - Detectar preferências de comunicação do usuário

3. **Integração Multicanal**:
   - Estender o agente para WhatsApp e Telegram
   - Permitir continuidade de conversas entre canais

4. **Aprendizado Contínuo**:
   - Sistema de melhorias baseado em interações anteriores
   - Refinamento automático de estratégias de persuasão

5. **Agente Proativo**:
   - Iniciar conversas baseadas em comportamento do usuário
   - Sugerir imóveis mesmo sem solicitação explícita

---

## 12. Conclusão

A integração de um agente de IA conversacional ao projeto Modulari representa uma evolução significativa na experiência do usuário, permitindo uma coleta de dados mais natural e aplicação de técnicas avançadas de persuasão. Mantendo a coexistência com o questionário estruturado, garantimos atender diversos perfis de usuários enquanto aproveitamos as vantagens de ambas as abordagens.

Esta implementação posiciona o Modulari na vanguarda das soluções imobiliárias digitais, oferecendo uma experiência mais personalizada e eficaz. O planejamento detalhado, combinado com uma abordagem de implementação gradual, minimiza riscos enquanto maximiza o potencial de impacto positivo nas métricas de negócio.

---

## Aprovações

| Nome | Cargo | Assinatura | Data |
|------|-------|------------|------|
| | | | |
| | | | |
| | | | |

---

*Fim do Documento*
