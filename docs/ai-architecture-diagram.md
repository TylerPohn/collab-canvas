graph TB
%% ========= USER INTERFACE LAYER =========
subgraph "User Interface Layer"
UI[AIPanel Component]
UI --> |User Input| NL[Natural Language Input]
UI --> |Sample Commands| SC[Sample Command Buttons]
UI --> |Manual Commands| MC[Manual Command Input]
UI --> |Selection Context| SS[Shape Selection Store]
end

    %% ========= AI AGENT SERVICE LAYER =========
    subgraph "AI Agent Service Layer"
        AS[AIAgentService]
        AS --> |Command Execution| CE[Command Executor]
        AS --> |Natural Language| NLP[Natural Language Processor]
        AS --> |Context Management| CM[Context Manager]
        AS --> |Rate Limiting| RL[Rate Limiter]
        AS --> |Security Validation| SV[Security Validator]
    end

    %% ========= AI TOOLS LAYER =========
    subgraph "AI Tools Layer"
        AT[AI Tools Factory]
        AT --> |Creation Tools| CT[Create Tools]
        AT --> |Manipulation Tools| MT[Manipulate Tools]
        AT --> |Layout Tools| LT[Layout Tools]
        AT --> |Context Tools| CXT[Context Tools]

        CT --> |createShape| CS[Create Shape]
        CT --> |createText| CTX[Create Text]
        CT --> |createLoginForm| CLF[Create Login Form]
        CT --> |createNavigationBar| CNB[Create Navigation Bar]
        CT --> |createCardLayout| CCL[Create Card Layout]

        MT --> |moveShape| MS[Move Shape]
        MT --> |resizeShape| RS[Resize Shape]
        MT --> |resizeLarger| RLG[Resize Larger]
        MT --> |resizeSmaller| RSM[Resize Smaller]
        MT --> |rotateShape| ROT[Rotate Shape]

        LT --> |arrangeInGrid| AIG[Arrange in Grid]
        LT --> |arrangeInRow| AIR[Arrange in Row]
        LT --> |spaceEvenly| SE[Space Evenly]

        CXT --> |getCanvasState| GCS[Get Canvas State]
        CXT --> |findShapes| FS[Find Shapes]
    end

    %% ========= VALIDATION & SCHEMA LAYER =========
    subgraph "Validation & Schema Layer"
        VS[Validation Service]
        VS --> |Zod Schemas| ZS[Zod Validation Schemas]
        VS --> |Parameter Validation| PV[Parameter Validator]
        VS --> |Command Validation| CV[Command Validator]
        VS --> |Sanitization| SAN[Parameter Sanitizer]
    end

    %% ========= CONTEXT MANAGEMENT LAYER =========
    subgraph "Context Management Layer"
        CML[Context Manager]
        CML --> |Session Context| SCX[Session Context]
        CML --> |Operation History| OH[Operation History]
        CML --> |Canvas State| CSX[Canvas State Cache]
        CML --> |Context Cleanup| CC[Context Cleanup]
    end

    %% ========= SECURITY LAYER =========
    subgraph "Security Layer"
        SL[Security Layer]
        SL --> |Rate Limiting| RLS[Rate Limiting Service]
        SL --> |Content Filtering| CF[Content Filter]
        SL --> |Parameter Validation| PVS[Parameter Validation]
        SL --> |Audit Logging| AL[Audit Logger]
    end

    %% ========= OPENAI INTEGRATION LAYER =========
    subgraph "OpenAI Integration Layer"
        OIL[OpenAI Service]
        OIL --> |Natural Language Processing| NLP_AI[OpenAI NLP]
        OIL --> |Function Calling| FC[Function Calling]
        OIL --> |Fallback Processing| FP[Fallback Processor]
        OIL --> |Error Handling| EH[Error Handler]
    end

    %% ========= CANVAS INTEGRATION LAYER =========
    subgraph "Canvas Integration Layer"
        CIL[Canvas Integration]
        CIL --> |Object Sync Service| OSS[Object Sync Service]
        CIL --> |Real-time Updates| RTU[Real-time Updates]
        CIL --> |Shape Operations| SO[Shape Operations]
        CIL --> |Layout Operations| LO[Layout Operations]
    end

    %% ========= DATA PERSISTENCE LAYER =========
    subgraph "Data Persistence Layer"
        DPL[Data Persistence]
        DPL --> |Firestore| FS_DB[Firestore Database]
        DPL --> |Canvas Documents| CD[Canvas Documents]
        DPL --> |Shape Objects| SO_DB[Shape Objects]
        DPL --> |Presence Data| PD[RTDB Presence Data]
    end

    %% ========= REACT INTEGRATION LAYER =========
    subgraph "React Integration Layer"
        RIL[React Integration]
        RIL --> |useAIAgent Hook| UAH[useAIAgent Hook]
        RIL --> |React Query| RQ[React Query Client]
        RIL --> |State Management| SM[State Management]
        RIL --> |Error Handling| REH[React Error Handler]
    end

    %% ========= FLOW CONNECTIONS =========
    UI --> |Commands| AS
    AS --> |Tool Execution| AT
    AT --> |Validation| VS
    AS --> |Context| CML
    AS --> |Security| SL
    AS --> |OpenAI| OIL
    AT --> |Canvas Operations| CIL
    CIL --> |Data Persistence| DPL
    AS --> |React Integration| RIL

    %% ========= COMMAND EXECUTION FLOW =========
    subgraph "Command Execution Flow"
        CEF[Command Execution Flow]
        CEF --> |1. Input Validation| IV[Input Validation]
        CEF --> |2. Rate Limiting Check| RLC[Rate Limiting Check]
        CEF --> |3. Security Validation| SVF[Security Validation]
        CEF --> |4. Context Retrieval| CR[Context Retrieval]
        CEF --> |5. Tool Selection| TS[Tool Selection]
        CEF --> |6. Parameter Validation| PVF[Parameter Validation]
        CEF --> |7. Tool Execution| TE[Tool Execution]
        CEF --> |8. Result Processing| RP[Result Processing]
        CEF --> |9. Context Update| CU[Context Update]
        CEF --> |10. Response Return| RR[Response Return]
    end

    %% ========= NATURAL LANGUAGE PROCESSING FLOW =========
    subgraph "Natural Language Processing Flow"
        NLPF[Natural Language Processing Flow]
        NLPF --> |1. User Input| UI_NLP[User Input]
        NLPF --> |2. OpenAI Processing| OAI[OpenAI Processing]
        NLPF --> |3. Function Call Extraction| FCE[Function Call Extraction]
        NLPF --> |4. Fallback Processing| FP_NLP[Fallback Processing]
        NLPF --> |5. Command Mapping| CM_NLP[Command Mapping]
        NLPF --> |6. Command Execution| CE_NLP[Command Execution]
    end

    %% ========= ERROR HANDLING & LOGGING =========
    subgraph "Error Handling & Logging"
        EHL[Error Handling & Logging]
        EHL --> |Error Types| ET[Error Types]
        EHL --> |Logging Service| LS[Logging Service]
        EHL --> |User Feedback| UF[User Feedback]
        EHL --> |Debug Information| DI[Debug Information]

        ET --> |Validation Errors| VE[Validation Errors]
        ET --> |Rate Limit Errors| RLE[Rate Limit Errors]
        ET --> |Network Errors| NE[Network Errors]
        ET --> |Context Errors| CE_ERR[Context Errors]
        ET --> |Tool Execution Errors| TEE[Tool Execution Errors]
    end

    %% ========= PERFORMANCE & MONITORING =========
    subgraph "Performance & Monitoring"
        PM[Performance & Monitoring]
        PM --> |Latency Monitoring| LM[Latency Monitoring]
        PM --> |Throughput Tracking| TT[Throughput Tracking]
        PM --> |Memory Management| MM[Memory Management]
        PM --> |Context Cleanup| CC_PM[Context Cleanup]

        LM --> |Target: <2s| T2S[Target: <2s Response]
        TT --> |30 req/min| R30[30 requests/minute]
        TT --> |500 req/hour| R500[500 requests/hour]
    end

    %% ========= STYLING FOR EXCALIDRAW COMPATIBILITY =========
    classDef userInterface fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef aiService fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef aiTools fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px
    classDef validation fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef context fill:#fce4ec,stroke:#880e4f,stroke-width:2px
    classDef security fill:#ffebee,stroke:#b71c1c,stroke-width:2px
    classDef openai fill:#e0f2f1,stroke:#004d40,stroke-width:2px
    classDef canvas fill:#f1f8e9,stroke:#33691e,stroke-width:2px
    classDef data fill:#e3f2fd,stroke:#0d47a1,stroke-width:2px
    classDef react fill:#fff8e1,stroke:#f57f17,stroke-width:2px
    classDef flow fill:#f9fbe7,stroke:#827717,stroke-width:2px
    classDef error fill:#ffebee,stroke:#c62828,stroke-width:2px
    classDef performance fill:#e8eaf6,stroke:#283593,stroke-width:2px

    class UI,NL,SC,MC,SS userInterface
    class AS,CE,NLP,CM,RL,SV aiService
    class AT,CT,MT,LT,CXT,CS,CTX,CLF,CNB,CCL,MS,RS,RLG,RSM,ROT,AIG,AIR,SE,GCS,FS aiTools
    class VS,ZS,PV,CV,SAN validation
    class CML,SCX,OH,CSX,CC context
    class SL,RLS,CF,PVS,AL security
    class OIL,NLP_AI,FC,FP,EH openai
    class CIL,OSS,RTU,SO,LO canvas
    class DPL,FS_DB,CD,SO_DB,PD data
    class RIL,UAH,RQ,SM,REH react
    class CEF,IV,RLC,SVF,CR,TS,PVF,TE,RP,CU,RR,NLPF,UI_NLP,OAI,FCE,FP_NLP,CM_NLP,CE_NLP flow
    class EHL,ET,LS,UF,DI,VE,RLE,NE,CE_ERR,TEE error
    class PM,LM,TT,MM,CC_PM,T2S,R30,R500 performance
