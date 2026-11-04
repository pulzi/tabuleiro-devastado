/*
 * Tabuleiro Devastado – Banco de perguntas
 *
 * Para acrescentar uma pergunta, copie um bloco { ... } e mude o texto.
 *
 *   id:         código único (não pode repetir). Ex.: 'fr-f6'
 *   tema:       'fraterna', 'moradia', 'qualidade', 'desigualdade' ou 'solidariedade'
 *   nivel:      'facil' (3 alternativas), 'medio' (4) ou 'dificil' (5)
 *   pergunta:   o enunciado
 *   certa:      a alternativa certa
 *   erradas:    alternativas erradas. Mínimo: 2 no fácil, 3 no médio, 4 no difícil.
 *               Se houver mais, o site sorteia quais aparecem.
 *   explicacao: aparece depois da resposta (certa ou errada)
 *
 * TAMANHO DAS ALTERNATIVAS (para o tamanho não entregar a resposta):
 *   - todas com tamanho parecido (a menor com pelo menos 85% da maior,
 *     ou no máximo 5 letras de diferença);
 *   - a certa NUNCA pode ser a mais comprida (pelo menos uma errada maior que ela);
 *   - a certa também não pode ser a mais curta (pelo menos uma errada menor ou igual).
 *
 * As perguntas de juros simples não ficam aqui: o app.js gera as contas sozinho.
 * Depois de mudar este arquivo, rode "node test.js": ele confere tudo isso.
 */
(function (root) {
  'use strict';

  const PERGUNTAS = [

    /* ==================== CIDADE FRATERNA ==================== */

    {
      id: 'fr-f1', tema: 'fraterna', nivel: 'facil',
      pergunta: 'O que é uma cidade fraterna?',
      certa: 'Uma cidade onde as pessoas cuidam umas das outras.',
      erradas: [
        'Uma cidade onde só quem tem dinheiro mora bem.',
        'Uma cidade cheia de prédios altos e muitos shoppings.',
        'Uma cidade onde cada um cuida só da própria vida.'
      ],
      explicacao: '"Fraterno" vem de irmão. Na cidade fraterna as pessoas se tratam como irmãs e lutam para que todos tenham moradia, saúde, escola e lazer.'
    },
    {
      id: 'fr-f2', tema: 'fraterna', nivel: 'facil',
      pergunta: 'Para que servem as praças e os parques de uma cidade?',
      certa: 'Para todos conviverem, brincarem e descansarem de graça.',
      erradas: [
        'Para guardar o lixo que a cidade produz todo santo dia.',
        'Para uso só de quem mora bem em frente à praça ou parque.',
        'Para servir de estacionamento aos carros do bairro.'
      ],
      explicacao: 'Praças e parques são espaços públicos: são de todos. Neles a vizinhança convive, faz exercício e tem lazer sem pagar nada.'
    },
    {
      id: 'fr-f3', tema: 'fraterna', nivel: 'facil',
      pergunta: 'Na sua rua, um vizinho idoso mora sozinho e está doente. Qual atitude combina com uma cidade fraterna?',
      certa: 'Perguntar se ele precisa de ajuda com remédio ou mercado.',
      erradas: [
        'Não se meter, afinal o problema é dele e não da vizinhança.',
        'Reclamar com ele do barulho alto da televisão à noite.',
        'Esperar que alguém da prefeitura apareça para ajudar.'
      ],
      explicacao: 'Pequenas atitudes de cuidado com quem está perto deixam a cidade mais fraterna. Quem está sozinho e doente precisa de uma rede de apoio.'
    },
    {
      id: 'fr-f4', tema: 'fraterna', nivel: 'facil',
      pergunta: 'Uma calçada com rampa, sem buracos e com piso tátil ajuda...',
      certa: 'Pessoas com deficiência, idosos e, no fim, todo mundo.',
      erradas: [
        'Só os motoristas que precisam estacionar o carro na rua.',
        'Apenas os atletas que gostam de correr pelas calçadas.',
        'Ninguém, porque rampa e piso tátil são só enfeites.'
      ],
      explicacao: 'Isso é acessibilidade: pensar a cidade para todas as pessoas. Rampas e piso tátil garantem o direito de ir e vir de quem tem mais dificuldade para andar ou enxergar, e facilitam a vida de quem empurra carrinho de bebê, por exemplo.'
    },
    {
      id: 'fr-f5', tema: 'fraterna', nivel: 'facil',
      pergunta: 'Jogar lixo na rua prejudica a cidade porque...',
      certa: 'Entope bueiros, causa alagamentos e atrai ratos e insetos.',
      erradas: [
        'Deixa as ruas mais coloridas e alegres para quem passa.',
        'Ajuda as plantas da calçada a crescerem bem mais rápido.',
        'Não prejudica nada, já que a chuva leva todo o lixo embora.'
      ],
      explicacao: 'O lixo da rua vai parar nos bueiros e nos rios. Com a chuva, a água não escoa e alaga as casas, muitas vezes justamente nos bairros mais pobres.'
    },

    {
      id: 'fr-m1', tema: 'fraterna', nivel: 'medio',
      pergunta: 'Os catadores de materiais recicláveis são importantes para a cidade porque...',
      certa: 'Tiram lixo das ruas e devolvem materiais para a reciclagem.',
      erradas: [
        'Aumentam a quantidade de lixo jogado nos rios da cidade.',
        'Fazem um trabalho que não traz benefício nenhum à cidade.',
        'Recolhem apenas o lixo das casas mais ricas do bairro nobre.'
      ],
      explicacao: 'Os catadores, muitas vezes organizados em cooperativas, fazem um serviço ambiental enorme. Eles merecem respeito e condições dignas de trabalho.'
    },
    {
      id: 'fr-m2', tema: 'fraterna', nivel: 'medio',
      pergunta: 'Em uma cidade fraterna, o transporte público deve...',
      certa: 'Chegar a todos os bairros, com preço que caiba no bolso.',
      erradas: [
        'Atender só o centro, onde ficam as lojas e os escritórios.',
        'Ser bem caro, para ter menos gente andando de ônibus.',
        'Parar de funcionar à noite, nos fins de semana e feriados.'
      ],
      explicacao: 'Desde 2015 o transporte é um direito social na Constituição (art. 6º). Sem ônibus, quem mora longe fica sem acesso ao trabalho, à escola e à saúde.'
    },
    {
      id: 'fr-m3', tema: 'fraterna', nivel: 'medio',
      pergunta: 'Um bairro transforma um terreno abandonado em uma horta comunitária. Qual é o principal ganho para a vizinhança?',
      certa: 'Comida saudável, terreno cuidado e vizinhos mais unidos.',
      erradas: [
        'Mais lixo acumulado e mais mosquitos espalhados no bairro.',
        'Uma pessoa só fica com tudo o que for plantado na horta.',
        'O terreno fica fechado com cadeado e ninguém pode entrar.'
      ],
      explicacao: 'Terreno abandonado junta lixo e bichos. A horta comunitária cuida do espaço, produz alimento e aproxima as pessoas.'
    },
    {
      id: 'fr-m4', tema: 'fraterna', nivel: 'medio',
      pergunta: 'Qual destas é uma forma de o morador participar das decisões da cidade?',
      certa: 'Ir a audiências públicas e conselhos para opinar no bairro.',
      erradas: [
        'Pichar os muros da prefeitura para mostrar a insatisfação.',
        'Nunca votar nem dar opinião sobre nada que acontece ali.',
        'Mudar de cidade toda vez que alguma coisa dá errado no bairro.'
      ],
      explicacao: 'Conselhos, audiências públicas e o orçamento participativo são espaços em que a população ajuda a decidir o que a cidade vai fazer.'
    },
    {
      id: 'fr-m5', tema: 'fraterna', nivel: 'medio',
      pergunta: 'Uma família de outro país chega à sua cidade fugindo de uma guerra. Qual atitude é de uma cidade fraterna?',
      certa: 'Acolher a família e ajudar com escola, saúde e documentos.',
      erradas: [
        'Rir do sotaque das crianças quando elas falam na escola.',
        'Exigir que a família volte logo para o país de onde ela veio.',
        'Ignorar a família, porque ela não nasceu aqui na cidade.'
      ],
      explicacao: 'Acolher refugiados e migrantes é um gesto de fraternidade. No Brasil, eles têm direito à escola pública e ao SUS, como qualquer pessoa.'
    },

    {
      id: 'fr-d1', tema: 'fraterna', nivel: 'dificil',
      pergunta: 'Qual lei federal, de 2001, traz regras para que a cidade cumpra a sua função social?',
      certa: 'O Estatuto da Cidade (Lei 10.257/2001).',
      erradas: [
        'O Estatuto da Criança e do Adolescente.',
        'O Código de Trânsito Brasileiro (CTB).',
        'A Lei de Diretrizes e Bases da Educação.',
        'O Código de Defesa do Consumidor (CDC).'
      ],
      explicacao: 'O Estatuto da Cidade regulamenta os artigos 182 e 183 da Constituição e traz ferramentas para que a cidade seja de todos, como o Plano Diretor.'
    },
    {
      id: 'fr-d2', tema: 'fraterna', nivel: 'dificil',
      pergunta: 'Pela Constituição, o Plano Diretor é obrigatório para cidades com mais de...',
      certa: '20 mil habitantes.',
      erradas: [
        '500 mil habitantes.',
        '5 mil habitantes.',
        '200 mil habitantes.',
        '100 mil habitantes.'
      ],
      explicacao: 'O artigo 182 da Constituição exige o Plano Diretor, aprovado pela Câmara Municipal, nas cidades com mais de 20 mil habitantes. É ele que organiza o crescimento da cidade.'
    },
    {
      id: 'fr-d3', tema: 'fraterna', nivel: 'dificil',
      pergunta: 'Um terreno no centro fica vazio por anos, só esperando valorizar, enquanto muitas famílias não têm onde morar. Depois de avisar o dono, a prefeitura pode...',
      certa: 'Cobrar IPTU cada vez mais alto (IPTU progressivo no tempo).',
      erradas: [
        'Proibir as famílias sem casa de morar dentro da cidade.',
        'Dar o terreno de presente para uma grande empresa de fora.',
        'Transformar o terreno em um lixão a céu aberto da cidade.',
        'Nada, porque terreno vazio sempre cumpre a sua função social.'
      ],
      explicacao: 'Imóvel parado só para especular não cumpre a função social da propriedade. O Estatuto da Cidade permite à prefeitura aplicar o IPTU progressivo no tempo.'
    },
    {
      id: 'fr-d4', tema: 'fraterna', nivel: 'dificil',
      pergunta: 'O que significa dizer que a propriedade deve cumprir a sua "função social"?',
      certa: 'Que o uso do imóvel deve beneficiar também a sociedade.',
      erradas: [
        'Que todo imóvel da cidade deve pertencer ao governo.',
        'Que o dono faz o que quiser, mesmo prejudicando os outros.',
        'Que os imóveis só podem ser usados para o comércio local.',
        'Que só pode ter casa própria quem nasceu na própria cidade.'
      ],
      explicacao: 'A Constituição garante o direito de propriedade, mas diz que ela deve atender à sua função social (art. 5º, inciso XXIII): o uso do imóvel não pode interessar só ao dono.'
    },
    {
      id: 'fr-d5', tema: 'fraterna', nivel: 'dificil',
      pergunta: 'Qual é a norma técnica brasileira com as regras de acessibilidade em prédios, calçadas e espaços públicos?',
      certa: 'Norma ABNT NBR 9050.',
      erradas: [
        'Norma ISO 9001:2015.',
        'Lei nº 8.245/1991.',
        'Lei Áurea, de 1888.',
        'Norma ISO 14001:2015.'
      ],
      explicacao: 'A NBR 9050 define medidas de rampas, corrimãos, banheiros adaptados, piso tátil e muito mais, para que todas as pessoas possam usar a cidade.'
    },

    /* ==================== MORADIAS POPULARES ==================== */

    {
      id: 'mo-f1', tema: 'moradia', nivel: 'facil',
      pergunta: 'O que é uma moradia popular?',
      certa: 'Uma casa para famílias de baixa renda, com preço acessível.',
      erradas: [
        'Uma mansão famosa que sempre aparece nas novelas da TV.',
        'Uma casa de praia para passar as férias com a família.',
        'Um prédio comercial cheio de lojas, bancos e escritórios caros.'
      ],
      explicacao: 'Moradias populares (ou habitação de interesse social) são feitas para que famílias que ganham pouco tenham uma casa digna, com preço ou parcelas que conseguem pagar.'
    },
    {
      id: 'mo-f2', tema: 'moradia', nivel: 'facil',
      pergunta: 'Ter uma casa digna para morar é...',
      certa: 'Um direito de todas as pessoas, sem exceção.',
      erradas: [
        'Um prêmio só para quem tira as melhores notas.',
        'Um luxo que só as pessoas ricas merecem ter.',
        'Um assunto que não tem importância para a cidade.'
      ],
      explicacao: 'A moradia é um direito social garantido pela Constituição brasileira (art. 6º) e pela Declaração Universal dos Direitos Humanos.'
    },
    {
      id: 'mo-f3', tema: 'moradia', nivel: 'facil',
      pergunta: 'O que é um mutirão de construção?',
      certa: 'Vizinhos e voluntários juntos construindo ou reformando casas.',
      erradas: [
        'Uma briga feia entre vizinhos por causa da altura do muro.',
        'Um tipo de tijolo muito caro, usado só em casas de luxo.',
        'Uma loja bem grande que vende cimento, areia e material de obra.'
      ],
      explicacao: 'No mutirão, cada um ajuda um pouco e a obra anda rápido. Muitos bairros populares foram construídos assim.'
    },
    {
      id: 'mo-f4', tema: 'moradia', nivel: 'facil',
      pergunta: 'Uma moradia digna precisa ter...',
      certa: 'Água limpa, banheiro, energia e um lugar seguro para dormir.',
      erradas: [
        'Piscina, churrasqueira e uma área de lazer bem grande.',
        'Uma televisão de tela bem grande em cada um dos cômodos.',
        'Garagem coberta para dois carros e um jardim com muitas flores.'
      ],
      explicacao: 'Moradia digna não é luxo: é ter o básico para viver com saúde e segurança.'
    },
    {
      id: 'mo-f5', tema: 'moradia', nivel: 'facil',
      pergunta: 'Muitas famílias moram em casas muito pequenas e sem conforto. Isso acontece principalmente porque...',
      certa: 'Elas ganham pouco, e os aluguéis e as casas são caros.',
      erradas: [
        'Elas gostam muito de morar em lugares bem apertados.',
        'É proibido por lei construir casas grandes no Brasil.',
        'Todas as casas do Brasil são pequenas desse mesmo jeito.'
      ],
      explicacao: 'Quando o salário é baixo e a moradia é cara, a família mora onde consegue pagar, mesmo sem conforto.'
    },

    {
      id: 'mo-m1', tema: 'moradia', nivel: 'medio',
      pergunta: 'O que é o déficit habitacional?',
      certa: 'A falta de moradias adequadas para as famílias que precisam.',
      erradas: [
        'O número de casas de praia que ficam vazias o ano inteiro.',
        'O valor que se paga por mês no aluguel de um apartamento.',
        'A quantidade de prédios bem altos que existem numa cidade grande.'
      ],
      explicacao: 'O déficit conta as famílias sem moradia adequada: casas precárias, famílias dividindo a mesma casa ou aluguel caro demais. No Brasil, faltam cerca de 6 milhões de moradias.'
    },
    {
      id: 'mo-m2', tema: 'moradia', nivel: 'medio',
      pergunta: 'O que é o aluguel social?',
      certa: 'Ajuda no aluguel para quem perdeu a casa num desastre.',
      erradas: [
        'Um aluguel cobrado para fazer festas no salão do bairro.',
        'Uma multa cobrada de quem atrasa o pagamento do aluguel.',
        'Um aluguel mais caro, cobrado de quem ganha menos.'
      ],
      explicacao: 'O aluguel social é um auxílio pago por um tempo pela prefeitura ou pelo estado a famílias que perderam a casa, como em enchentes ou desabamentos, enquanto esperam uma moradia definitiva.'
    },
    {
      id: 'mo-m3', tema: 'moradia', nivel: 'medio',
      pergunta: 'Uma família gasta mais da metade do que ganha só com o aluguel. Qual é o problema?',
      certa: 'Sobra pouco para comida, saúde, transporte e outras contas.',
      erradas: [
        'Nenhum, porque aluguel caro sempre significa uma casa boa.',
        'A família fica mais rica no fim do mês, com dinheiro sobrando.',
        'O dono da casa é obrigado a devolver o dinheiro no fim do ano.'
      ],
      explicacao: 'Quando o aluguel pesa demais (mais de 30% da renda das famílias mais pobres), isso se chama ônus excessivo com aluguel e entra na conta do déficit habitacional.'
    },
    {
      id: 'mo-m4', tema: 'moradia', nivel: 'medio',
      pergunta: 'Qual programa do governo federal, criado em 2009, ajuda famílias de baixa renda a ter a casa própria?',
      certa: 'Minha Casa, Minha Vida.',
      erradas: [
        'Programa Mais Médicos.',
        'Programa Luz para Todos.',
        'Programa Bolsa Atleta.'
      ],
      explicacao: 'O Minha Casa, Minha Vida financia moradias com parcelas menores, de acordo com a renda da família.'
    },
    {
      id: 'mo-m5', tema: 'moradia', nivel: 'medio',
      pergunta: 'Por que não basta construir moradias populares muito longe, sem ônibus, escola ou posto de saúde por perto?',
      certa: 'A família ganha a casa, mas perde acesso a trabalho e saúde.',
      erradas: [
        'Casas longe do centro são sempre maiores e bem mais caras.',
        'Ninguém gosta de morar em lugares calmos e muito tranquilos.',
        'Na verdade basta, pois a casa é a única coisa que importa mesmo.'
      ],
      explicacao: 'Morar bem é ter casa e também cidade: transporte, escola, saúde e lazer por perto.'
    },

    {
      id: 'mo-d1', tema: 'moradia', nivel: 'dificil',
      pergunta: 'Em que ano a moradia entrou na lista de direitos sociais do artigo 6º da Constituição Federal?',
      certa: 'No ano 2000, pela Emenda Constitucional nº 26.',
      erradas: [
        'Em 1888, junto com a assinatura da Lei Áurea.',
        'Em 1500, com a chegada dos portugueses ao Brasil.',
        'Em 2020, durante a pandemia de covid-19 no país.',
        'Nunca, porque a moradia não está na Constituição.'
      ],
      explicacao: 'A Constituição é de 1988, mas a moradia só foi incluída no art. 6º em 2000. Hoje ela está ao lado da educação, da saúde e da alimentação.'
    },
    {
      id: 'mo-d2', tema: 'moradia', nivel: 'dificil',
      pergunta: 'O que são as ZEIS (Zonas Especiais de Interesse Social)?',
      certa: 'Áreas para moradia popular e para melhorar comunidades.',
      erradas: [
        'Zonas onde é totalmente proibido construir casas e prédios.',
        'Áreas da cidade reservadas só para fábricas e indústrias.',
        'Bairros exclusivos para condomínios de luxo e mansões.',
        'Reservas ambientais fechadas, onde ninguém pode entrar.'
      ],
      explicacao: 'As ZEIS ficam no Plano Diretor. Elas protegem as comunidades que já existem e reservam terrenos bem localizados para habitação de interesse social.'
    },
    {
      id: 'mo-d3', tema: 'moradia', nivel: 'dificil',
      pergunta: 'A regularização fundiária urbana (Reurb) serve para...',
      certa: 'Dar o documento da casa e levar água, luz e esgoto ao bairro.',
      erradas: [
        'Derrubar todas as casas que ainda não têm documento na cidade.',
        'Aumentar o preço dos aluguéis nos bairros mais afastados.',
        'Proibir que novas famílias venham morar na cidade grande.',
        'Transformar bairros urbanos em fazendas e sítios de plantio.'
      ],
      explicacao: 'Com a Reurb (Lei 13.465/2017), as famílias recebem o título da moradia e o bairro ganha água, esgoto, luz e ruas. O documento dá segurança para a família.'
    },
    {
      id: 'mo-d4', tema: 'moradia', nivel: 'dificil',
      pergunta: 'Pela Constituição, quem mora há 5 anos, sem oposição, num terreno urbano de até 250 m² e não tem outro imóvel pode pedir para ser dono dele. Como isso se chama?',
      certa: 'Usucapião especial urbana.',
      erradas: [
        'Hipoteca especial urbana.',
        'Herança de imóvel urbano.',
        'Despejo por ordem judicial.',
        'Leilão de imóvel público.'
      ],
      explicacao: 'O artigo 183 da Constituição garante a usucapião especial urbana a quem usa a área para morar com a família. É uma forma de garantir o direito à moradia.'
    },
    {
      id: 'mo-d5', tema: 'moradia', nivel: 'dificil',
      pergunta: 'Segundo a Fundação João Pinheiro, quantas moradias faltavam no Brasil em 2022 (déficit habitacional)?',
      certa: 'Cerca de 6 milhões.',
      erradas: [
        'Cerca de 6 mil.',
        'Cerca de 60 mil.',
        'Cerca de 600 mil.',
        'Cerca de 60 milhões.'
      ],
      explicacao: 'O déficit habitacional de 2022 ficou em cerca de 6,2 milhões de domicílios. A conta inclui casas precárias, famílias dividindo a mesma casa e aluguel caro demais.'
    },

    /* ==================== CASAS DE QUALIDADE ==================== */

    {
      id: 'qu-f1', tema: 'qualidade', nivel: 'facil',
      pergunta: 'Por que é importante ter janelas que abrem em todos os cômodos da casa?',
      certa: 'Para entrar luz e ar fresco, o que ajuda a evitar mofo.',
      erradas: [
        'Para os vizinhos conseguirem ver a televisão lá de fora.',
        'Só para enfeitar as paredes e deixar a casa mais bonita.',
        'Para deixar a casa mais escura e abafada durante o dia.'
      ],
      explicacao: 'A luz do sol e a ventilação secam a umidade, renovam o ar e deixam a casa mais saudável.'
    },
    {
      id: 'qu-f2', tema: 'qualidade', nivel: 'facil',
      pergunta: 'Qual é o jeito certo de guardar água em casa para evitar a dengue?',
      certa: 'Manter caixa d\'água, baldes e tambores sempre tampados.',
      erradas: [
        'Deixar os baldes destampados no quintal para pegar chuva.',
        'Guardar a água da chuva em pneus velhos no quintal de casa.',
        'Deixar água parada nos pratinhos dos vasos de plantas.'
      ],
      explicacao: 'O mosquito Aedes aegypti, que transmite a dengue, põe ovos em água parada. Tampar os recipientes impede isso.'
    },
    {
      id: 'qu-f3', tema: 'qualidade', nivel: 'facil',
      pergunta: 'Para que serve a rede de esgoto?',
      certa: 'Levar a água suja das casas até uma estação de tratamento.',
      erradas: [
        'Trazer água limpa e tratada para as pessoas beberem em casa.',
        'Levar energia elétrica até as casas e os postes da rua.',
        'Guardar o lixo reciclável até o caminhão da coleta passar lá.'
      ],
      explicacao: 'Sem rede de esgoto, a água suja do banheiro e da cozinha corre perto das casas e espalha doenças. Com ela, o esgoto vai para uma estação de tratamento.'
    },
    {
      id: 'qu-f4', tema: 'qualidade', nivel: 'facil',
      pergunta: 'Fazer "gato" de energia (ligação improvisada e escondida) é perigoso porque...',
      certa: 'Pode causar choques, curtos-circuitos e até incêndios.',
      erradas: [
        'Deixa a luz da casa mais forte e muito mais segura.',
        'Não tem perigo nenhum, porque é só uma ligação diferente.',
        'Faz a casa gastar bem menos energia elétrica no mês.'
      ],
      explicacao: 'Fios mal instalados esquentam e podem pegar fogo. Famílias de baixa renda inscritas no CadÚnico podem ter desconto na conta de luz pela Tarifa Social.'
    },
    {
      id: 'qu-f5', tema: 'qualidade', nivel: 'facil',
      pergunta: 'O que deixa uma casa mais segura para as crianças?',
      certa: 'Tomadas protegidas e produtos de limpeza fora do alcance.',
      erradas: [
        'Fios elétricos soltos e espalhados pelo chão da sala.',
        'Remédios guardados em cima da mesa, bem à vista das crianças.',
        'Panelas no fogão com o cabo virado para fora, na beirada.'
      ],
      explicacao: 'Muitos acidentes com crianças acontecem dentro de casa. Pequenos cuidados evitam choques, queimaduras e intoxicações.'
    },

    {
      id: 'qu-m1', tema: 'qualidade', nivel: 'medio',
      pergunta: 'Uma casa com paredes úmidas e cheias de mofo pode causar...',
      certa: 'Doenças respiratórias, como asma, rinite e bronquite.',
      erradas: [
        'Dor de dente e cáries, principalmente nas crianças.',
        'Mais saúde e mais disposição para quem mora na casa.',
        'Fraturas nos ossos dos braços e das pernas das pessoas.'
      ],
      explicacao: 'O mofo solta no ar partículas que irritam o nariz e os pulmões. Ventilar a casa e impermeabilizar as paredes ajudam a resolver.'
    },
    {
      id: 'qu-m2', tema: 'qualidade', nivel: 'medio',
      pergunta: 'Esgoto correndo a céu aberto perto das casas pode transmitir...',
      certa: 'Doenças como diarreia, hepatite A e verminoses.',
      erradas: [
        'Nenhuma doença, porque a água suja logo evapora.',
        'Apenas alergia ao pólen das flores das árvores.',
        'Só miopia e outros problemas leves de visão.'
      ],
      explicacao: 'Água contaminada por esgoto espalha micróbios e vermes. Por isso o saneamento básico é tão importante para a saúde.'
    },
    {
      id: 'qu-m3', tema: 'qualidade', nivel: 'medio',
      pergunta: 'Por que é perigoso construir casas em encostas de morro ou na beira de rios?',
      certa: 'Há risco de deslizamento de terra e de enchentes nas chuvas.',
      erradas: [
        'A vista lá de cima é bonita demais e distrai os moradores.',
        'Nesses lugares nunca bate sol, nem mesmo nos dias de verão.',
        'Não é perigoso, porque são os lugares mais seguros da cidade.'
      ],
      explicacao: 'Muitas famílias moram em áreas de risco por falta de opção. Uma cidade justa oferece moradia segura e faz obras de contenção e drenagem.'
    },
    {
      id: 'qu-m4', tema: 'qualidade', nivel: 'medio',
      pergunta: 'Uma casa de um quarto só, onde dormem 6 pessoas, tem um problema chamado...',
      certa: 'Adensamento excessivo (gente demais por dormitório).',
      erradas: [
        'Excesso de conforto e de espaço livre para cada morador.',
        'Casa de veraneio, usada só nas férias de fim de ano.',
        'Ventilação cruzada, com janelas em lados opostos.'
      ],
      explicacao: 'No Brasil, mais de 3 pessoas por dormitório é considerado adensamento excessivo. Isso tira a privacidade, atrapalha o sono e o estudo e facilita a transmissão de doenças.'
    },
    {
      id: 'qu-m5', tema: 'qualidade', nivel: 'medio',
      pergunta: 'Uma casa tem ventilação cruzada quando...',
      certa: 'Há janelas em lados opostos, e o ar entra e sai da casa.',
      erradas: [
        'Tem uma janela pequena só, que fica no banheiro da casa.',
        'O ventilador fica ligado o dia inteiro, sem parar nunca.',
        'As janelas e as portas ficam sempre fechadas, dia e noite.'
      ],
      explicacao: 'Com aberturas em lados opostos, o vento atravessa a casa, renova o ar e diminui o calor e a umidade sem gastar energia.'
    },

    {
      id: 'qu-d1', tema: 'qualidade', nivel: 'dificil',
      pergunta: 'Segundo a Lei do Saneamento Básico (Lei 11.445/2007), o saneamento é formado por...',
      certa: 'Água, esgoto, limpeza urbana e drenagem da água da chuva.',
      erradas: [
        'Água potável, energia elétrica, internet e gás de cozinha.',
        'Esgoto, asfalto nas ruas, iluminação pública e telefone.',
        'Somente a água tratada que sai pela torneira de casa.',
        'Coleta de lixo, transporte público, escolas e postos de saúde.'
      ],
      explicacao: 'Os quatro serviços do saneamento básico são: abastecimento de água, esgotamento sanitário, limpeza urbana e manejo de resíduos sólidos, e drenagem das águas da chuva.'
    },
    {
      id: 'qu-d2', tema: 'qualidade', nivel: 'dificil',
      pergunta: 'O Marco Legal do Saneamento, de 2020, tem como meta que até 2033...',
      certa: '99% tenham água potável e 90% tenham coleta de esgoto.',
      erradas: [
        'Todas as casas do Brasil tenham piscina e área de lazer.',
        'Apenas metade da população tenha água potável em casa.',
        'O esgoto continue sendo jogado direto nos rios do país.',
        'Só as capitais dos estados tenham saneamento completo.'
      ],
      explicacao: 'A Lei 14.026/2020 fixou essas metas (99% da população com água potável e 90% com coleta e tratamento de esgoto) porque milhões de brasileiros ainda vivem sem esses serviços.'
    },
    {
      id: 'qu-d3', tema: 'qualidade', nivel: 'dificil',
      pergunta: 'A Tarifa Social de Energia Elétrica dá desconto na conta de luz para...',
      certa: 'Famílias de baixa renda inscritas no Cadastro Único.',
      erradas: [
        'Quem gasta mais energia elétrica durante todo o mês.',
        'Empresas grandes, fábricas e indústrias de todo o país.',
        'Quem mora em casas de luxo nos bairros mais caros.',
        'Somente quem tem placa solar instalada no telhado.'
      ],
      explicacao: 'A tarifa social reduz a conta das famílias mais pobres inscritas no CadÚnico e ajuda a ter energia segura em casa, sem precisar de "gato".'
    },
    {
      id: 'qu-d4', tema: 'qualidade', nivel: 'dificil',
      pergunta: 'Em enchentes, a água pode transmitir leptospirose. Essa doença vem principalmente...',
      certa: 'Da urina de ratos misturada à água da enchente.',
      erradas: [
        'Da picada do mosquito da dengue, o Aedes aegypti.',
        'De tomar sol forte logo depois que a chuva passa.',
        'Do frio da chuva, que deixa o corpo mais fraco.',
        'De comer frutas e verduras que foram bem lavadas.'
      ],
      explicacao: 'A bactéria da leptospirose sai na urina dos ratos. O lixo acumulado atrai ratos e a enchente espalha a bactéria. Por isso é importante evitar contato com a água da enchente.'
    },
    {
      id: 'qu-d5', tema: 'qualidade', nivel: 'dificil',
      pergunta: 'A Lei 11.888/2008 garante às famílias de baixa renda...',
      certa: 'Arquiteto e engenheiro de graça para construir ou reformar.',
      erradas: [
        'Uma casa nova totalmente de graça para cada família pobre.',
        'Desconto especial para comprar carros e motos zero quilômetro.',
        'Internet grátis e rápida em casa para todos os moradores.',
        'Isenção total das contas de água e de luz, para sempre.'
      ],
      explicacao: 'É a assistência técnica gratuita para moradia: com ela, a família constrói ou reforma com segurança, sem rachaduras, umidade ou risco de desabar. A lei vale para famílias com renda de até 3 salários mínimos.'
    },

    /* ==================== DESIGUALDADE SOCIAL ==================== */

    {
      id: 'de-f1', tema: 'desigualdade', nivel: 'facil',
      pergunta: 'O que é desigualdade social?',
      certa: 'Quando alguns têm muito e outros não têm o básico.',
      erradas: [
        'Quando todas as pessoas ganham o mesmo salário.',
        'Quando as pessoas gostam de músicas diferentes.',
        'Quando a cidade tem muitos parques e praças verdes.'
      ],
      explicacao: 'Desigualdade social é uma diferença grande de renda e de acesso a direitos, como moradia, saúde e educação.'
    },
    {
      id: 'de-f2', tema: 'desigualdade', nivel: 'facil',
      pergunta: 'Em muitas cidades, os bairros mais pobres ficam longe do centro. Que dificuldade isso traz?',
      certa: 'Moradores gastam muito tempo e dinheiro com transporte.',
      erradas: [
        'Nenhuma, porque longe do centro tudo fica mais fácil.',
        'Os moradores ficam mais perto dos empregos e das escolas.',
        'Os ônibus passam com muito mais frequência nesses bairros.'
      ],
      explicacao: 'Horas no ônibus todo dia significam menos tempo para estudar, descansar e ficar com a família.'
    },
    {
      id: 'de-f3', tema: 'desigualdade', nivel: 'facil',
      pergunta: 'Comunidades de favela muitas vezes surgem porque...',
      certa: 'Muitas famílias não conseguem pagar uma moradia formal.',
      erradas: [
        'As pessoas preferem morar bem longe de tudo e de todos.',
        'O governo obriga as famílias a morarem nesses lugares.',
        'Lá ficam os terrenos mais caros e mais valorizados da cidade.'
      ],
      explicacao: 'Com salários baixos e aluguéis caros, muitas famílias constroem a própria casa onde conseguem. As favelas mostram a força dessas comunidades e também a falta de apoio do poder público.'
    },
    {
      id: 'de-f4', tema: 'desigualdade', nivel: 'facil',
      pergunta: 'Qual atitude ajuda a diminuir a desigualdade?',
      certa: 'Garantir escola de qualidade, saúde e moradia para todos.',
      erradas: [
        'Deixar as melhores escolas só para quem pode pagar caro.',
        'Rir de quem tem menos e espalhar isso nas redes sociais.',
        'Proibir as crianças pobres de brincarem na praça do bairro.'
      ],
      explicacao: 'Quando todos têm acesso aos mesmos direitos, as oportunidades ficam mais iguais.'
    },
    {
      id: 'de-f5', tema: 'desigualdade', nivel: 'facil',
      pergunta: 'Tratar alguém mal por causa da roupa que usa ou do bairro onde mora é...',
      certa: 'Preconceito, e isso aumenta a desigualdade.',
      erradas: [
        'Uma brincadeira normal, sem problema nenhum.',
        'Um elogio sincero à roupa e ao bairro da pessoa.',
        'Uma regra da escola que todos devem seguir.'
      ],
      explicacao: 'O preconceito exclui as pessoas e fecha portas, como vagas de emprego. O respeito é o primeiro passo para uma cidade mais justa.'
    },

    {
      id: 'de-m1', tema: 'desigualdade', nivel: 'medio',
      pergunta: 'Qual situação mostra que uma cidade é desigual?',
      certa: 'Bairros com esgoto e parques ao lado de bairros sem nada disso.',
      erradas: [
        'Ruas com nomes bem diferentes umas das outras no mesmo bairro.',
        'Escolas com uniformes de cores bem diferentes em cada um dos bairros.',
        'Prédios com alturas bem diferentes no centro e nas periferias.'
      ],
      explicacao: 'A desigualdade aparece no mapa: alguns bairros recebem muitos serviços públicos e outros quase nenhum.'
    },
    {
      id: 'de-m2', tema: 'desigualdade', nivel: 'medio',
      pergunta: 'Uma criança precisa trabalhar para ajudar em casa e falta à escola. Por que isso é um problema de desigualdade?',
      certa: 'Ela perde a chance de estudar, e isso pode limitar o futuro.',
      erradas: [
        'Assim ela ganha mais tempo livre para brincar com os amigos.',
        'Isso não tem nenhuma relação com a desigualdade social.',
        'Trabalhar desde pequeno é obrigatório para crianças no Brasil.'
      ],
      explicacao: 'No Brasil, o trabalho é proibido para menores de 16 anos, a não ser como aprendiz a partir dos 14. A escola é um direito e um caminho para diminuir a desigualdade.'
    },
    {
      id: 'de-m3', tema: 'desigualdade', nivel: 'medio',
      pergunta: 'O IDH (Índice de Desenvolvimento Humano) mede...',
      certa: 'A renda, a educação e a saúde (expectativa de vida).',
      erradas: [
        'Só a quantidade de prédios e de casas que há na cidade.',
        'O número de carros que existem para cada pessoa.',
        'A altura média e o peso médio das pessoas do país.'
      ],
      explicacao: 'O IDH vai de 0 a 1. Quanto mais perto de 1, melhores as condições de vida da população.'
    },
    {
      id: 'de-m4', tema: 'desigualdade', nivel: 'medio',
      pergunta: 'O bairro rico tem um parque e o bairro pobre não tem nenhuma praça. Qual seria a decisão mais justa?',
      certa: 'Investir primeiro em lazer e serviços no bairro que tem menos.',
      erradas: [
        'Construir um segundo parque, ainda maior, no bairro rico.',
        'Fechar o parque do bairro rico para todo mundo, por igual.',
        'Começar a cobrar entrada no parque para pagar as reformas dele.'
      ],
      explicacao: 'Isso é equidade: dar mais para quem tem menos, até que todos tenham as mesmas oportunidades.'
    },
    {
      id: 'de-m5', tema: 'desigualdade', nivel: 'medio',
      pergunta: 'No Censo 2022, o IBGE trocou o nome "aglomerados subnormais" por...',
      certa: 'Favelas e comunidades urbanas.',
      erradas: [
        'Bairros nobres e planejados.',
        'Condomínios fechados de luxo.',
        'Áreas rurais e zonas de fazenda.'
      ],
      explicacao: 'O IBGE mudou o nome depois de debater com movimentos sociais, para usar palavras que os próprios moradores reconhecem, sem preconceito.'
    },

    {
      id: 'de-d1', tema: 'desigualdade', nivel: 'dificil',
      pergunta: 'O coeficiente de Gini mede a desigualdade de renda. Um país com Gini mais perto de 1 é...',
      certa: 'Mais desigual na renda.',
      erradas: [
        'Mais igualitário na renda.',
        'Mais rico em dinheiro.',
        'Mais populoso e cheio.',
        'Mais frio no inverno.'
      ],
      explicacao: 'O Gini vai de 0 (todos com a mesma renda) a 1 (uma só pessoa com toda a renda). O Brasil está entre os países mais desiguais do mundo.'
    },
    {
      id: 'de-d2', tema: 'desigualdade', nivel: 'dificil',
      pergunta: 'Segundo o Censo 2022 do IBGE, quantas pessoas moravam em favelas e comunidades urbanas no Brasil?',
      certa: 'Cerca de 16 milhões.',
      erradas: [
        'Cerca de 16 mil.',
        'Cerca de 160 mil.',
        'Cerca de 1 milhão.',
        'Cerca de 160 milhões.'
      ],
      explicacao: 'Eram cerca de 16,4 milhões de pessoas, ou 8,1% da população, em mais de 12 mil favelas e comunidades urbanas.'
    },
    {
      id: 'de-d3', tema: 'desigualdade', nivel: 'dificil',
      pergunta: 'O que é gentrificação?',
      certa: 'O bairro se valoriza, o aluguel sobe e os mais pobres saem.',
      erradas: [
        'O bairro fica abandonado, sem moradores e sem comércio.',
        'A prefeitura constrói muitas moradias populares no bairro.',
        'Os vizinhos se juntam para pintar as casas da rua toda.',
        'O bairro muda de nome depois de uma votação entre os moradores.'
      ],
      explicacao: 'A gentrificação "expulsa" sem despejo: o custo de vida sobe e quem morava ali há anos não consegue mais pagar.'
    },
    {
      id: 'de-d4', tema: 'desigualdade', nivel: 'dificil',
      pergunta: 'Igualdade e equidade são diferentes. Qual exemplo mostra EQUIDADE?',
      certa: 'Dar reforço a quem tem mais dificuldade, para todos aprenderem.',
      erradas: [
        'Dar exatamente a mesma coisa a todos, mesmo a quem precisa mais.',
        'Dar sempre mais coisas para quem já tem mais do que os outros.',
        'Não dar nada para ninguém, assim ninguém reclama de nada.',
        'Sortear quem vai receber ajuda, sem olhar quem precisa.'
      ],
      explicacao: 'Igualdade é tratar todos do mesmo jeito. Equidade é dar a cada um o que precisa para chegar ao mesmo ponto.'
    },
    {
      id: 'de-d5', tema: 'desigualdade', nivel: 'dificil',
      pergunta: 'Por que a falta de saneamento também é um problema de desigualdade?',
      certa: 'Falta mais nas periferias, onde as pessoas adoecem mais.',
      erradas: [
        'Só os ricos ficam doentes quando não há rede de esgoto.',
        'O saneamento só é mesmo necessário no centro da cidade.',
        'Não é, porque o saneamento chega igual para todo mundo.',
        'O esgoto a céu aberto melhora a saúde de quem mora perto.'
      ],
      explicacao: 'As doenças ligadas à falta de saneamento atingem mais quem já tem menos, que adoece mais e perde dias de escola e de trabalho. Levar água e esgoto a todos também é diminuir a desigualdade.'
    },

    /* ==================== SOLIDARIEDADE ==================== */

    {
      id: 'so-f1', tema: 'solidariedade', nivel: 'facil',
      pergunta: 'O que é solidariedade?',
      certa: 'Ajudar e apoiar quem está passando por dificuldade.',
      erradas: [
        'Ficar sempre sozinho, sem falar nem ajudar ninguém.',
        'Ajudar os outros só quando recebe dinheiro em troca.',
        'Competir o tempo todo para ser melhor que os colegas.'
      ],
      explicacao: 'Ser solidário é sentir que o problema do outro também é nosso e agir para ajudar.'
    },
    {
      id: 'so-f2', tema: 'solidariedade', nivel: 'facil',
      pergunta: 'Um colega perdeu o material escolar numa enchente. Qual atitude é solidária?',
      certa: 'Organizar com a turma uma doação de cadernos e lápis.',
      erradas: [
        'Fingir que não sabe de nada e mudar logo de assunto.',
        'Fazer piada com os colegas sobre o que aconteceu.',
        'Vender um material velho e usado bem caro para o colega.'
      ],
      explicacao: 'Quando a turma se une, um problema grande fica pequeno.'
    },
    {
      id: 'so-f3', tema: 'solidariedade', nivel: 'facil',
      pergunta: 'Qual destas é uma forma de ser voluntário?',
      certa: 'Ajudar de graça numa campanha de arrecadação de alimentos.',
      erradas: [
        'Cobrar um bom dinheiro para ajudar o vizinho na mudança.',
        'Ficar em casa só reclamando dos problemas do bairro.',
        'Jogar o lixo na rua só para dar trabalho aos garis da cidade.'
      ],
      explicacao: 'Voluntário é quem doa o seu tempo e o seu trabalho para uma causa, sem receber dinheiro.'
    },
    {
      id: 'so-f4', tema: 'solidariedade', nivel: 'facil',
      pergunta: 'O que é empatia?',
      certa: 'Se colocar no lugar do outro para entender o que ele sente.',
      erradas: [
        'Pensar só em si mesmo e no que é melhor para você, sempre.',
        'Ficar com raiva de quem pensa ou vive de um jeito diferente.',
        'Concordar com tudo o que os outros dizem, sem nem pensar.'
      ],
      explicacao: 'A empatia é o começo da solidariedade: quando entendemos o outro, dá vontade de ajudar.'
    },
    {
      id: 'so-f5', tema: 'solidariedade', nivel: 'facil',
      pergunta: 'Um colega novo chega à escola e não conhece ninguém. O que é mais solidário?',
      certa: 'Convidar o colega para sentar junto e entrar nas brincadeiras.',
      erradas: [
        'Deixar o colega sozinho no recreio até ele se acostumar.',
        'Rir dele com a turma toda só porque ele é novo na escola.',
        'Esconder a mochila dele para ver se ele fica bravo com a turma.'
      ],
      explicacao: 'Acolher faz a pessoa se sentir parte do grupo. Ninguém gosta de ficar de fora.'
    },

    {
      id: 'so-m1', tema: 'solidariedade', nivel: 'medio',
      pergunta: 'Ao ajudar uma família que precisa, qual é o jeito mais respeitoso?',
      certa: 'Ajudar sem humilhar nem expor, respeitando a família.',
      erradas: [
        'Postar fotos da família nas redes sociais da escola.',
        'Ajudar só se a família agradecer em público, para todos.',
        'Dar comida vencida, porque a família não vai reclamar.'
      ],
      explicacao: 'Solidariedade de verdade respeita a dignidade da pessoa ajudada. Ninguém deve ser exposto ou humilhado por precisar de ajuda.'
    },
    {
      id: 'so-m2', tema: 'solidariedade', nivel: 'medio',
      pergunta: 'Por que doar roupas em bom estado é melhor do que doar roupas rasgadas e sujas?',
      certa: 'Porque quem recebe merece algo digno, que sirva de verdade.',
      erradas: [
        'Porque roupas rasgadas e sujas são bem mais caras nas lojas.',
        'Não faz diferença nenhuma, porque doação é sempre doação.',
        'Porque doar é só um jeito fácil de se livrar do que não presta.'
      ],
      explicacao: 'Antes de doar, vale perguntar: "eu usaria isso?". Doação é cuidado com o outro, não descarte.'
    },
    {
      id: 'so-m3', tema: 'solidariedade', nivel: 'medio',
      pergunta: 'Num fim de semana, vizinhos se reúnem para consertar o telhado de uma família. Isso é um exemplo de...',
      certa: 'Um mutirão solidário da vizinhança.',
      erradas: [
        'Uma concorrência entre os vizinhos.',
        'Um despejo feito pela vizinhança.',
        'Uma especulação imobiliária no bairro.'
      ],
      explicacao: 'No mutirão, cada um dá um pouco do seu tempo e do seu talento, e a comunidade resolve o problema junta.'
    },
    {
      id: 'so-m4', tema: 'solidariedade', nivel: 'medio',
      pergunta: 'O que é um banco de alimentos?',
      certa: 'Um lugar que junta comida que iria para o lixo e doa.',
      erradas: [
        'Um banco onde se guarda dinheiro para comprar comida.',
        'Um banco de praça feito de comida, para as pessoas sentarem.',
        'Um restaurante caro que só aceita clientes muito ricos.'
      ],
      explicacao: 'Os bancos de alimentos recolhem comida que seria desperdiçada e entregam para quem precisa: combatem a fome e o desperdício ao mesmo tempo.'
    },
    {
      id: 'so-m5', tema: 'solidariedade', nivel: 'medio',
      pergunta: 'Depois de uma enchente, qual destas doações costuma ser mais útil para as famílias atingidas?',
      certa: 'Água potável, comida que não estraga e produtos de limpeza.',
      erradas: [
        'Brinquedos quebrados e jogos que estão faltando peças.',
        'Comida que estraga rápido quando fica fora da geladeira.',
        'Roupas de festa, sapatos de salto alto e fantasias de carnaval.'
      ],
      explicacao: 'Quem perdeu tudo precisa primeiro do básico: água, comida e limpeza para voltar para casa com segurança.'
    },

    {
      id: 'so-d1', tema: 'solidariedade', nivel: 'dificil',
      pergunta: 'Herbert de Souza, o Betinho, criou em 1993 uma grande campanha nacional. Qual?',
      certa: 'A Ação da Cidadania contra a Fome, a Miséria e pela Vida.',
      erradas: [
        'A Campanha Nacional do Desarmamento, contra as armas.',
        'O programa Bolsa Família, de transferência de renda.',
        'O Estatuto da Cidade, que organiza o uso das cidades.',
        'O movimento das Diretas Já, pelo voto direto para presidente.'
      ],
      explicacao: 'A campanha do Betinho mobilizou milhões de brasileiros para arrecadar alimentos e mostrou que a fome é um problema de todos.'
    },
    {
      id: 'so-d2', tema: 'solidariedade', nivel: 'dificil',
      pergunta: 'Dar uma cesta básica ajuda hoje. O que torna a solidariedade ainda mais transformadora?',
      certa: 'Unir as pessoas para cobrar soluções para as causas da pobreza.',
      erradas: [
        'Ajudar uma vez só e depois nunca mais pensar nesse assunto.',
        'Ajudar apenas quem vai poder devolver o favor mais tarde.',
        'Deixar tudo para o governo resolver e não fazer mais nada.',
        'Ajudar só para tirar fotos e aparecer bem nas redes sociais depois.'
      ],
      explicacao: 'A ajuda imediata é importante, mas mudar as causas da pobreza, como a falta de emprego e de moradia, é o que evita que o problema volte.'
    },
    {
      id: 'so-d3', tema: 'solidariedade', nivel: 'dificil',
      pergunta: 'A médica Zilda Arns fundou, em 1983, uma pastoral que salvou milhares de crianças com medidas simples, como o soro caseiro. Qual é o nome dela?',
      certa: 'Pastoral da Criança.',
      erradas: [
        'Pastoral da Terra.',
        'Pastoral Carcerária.',
        'Pastoral da Juventude.',
        'Pastoral da Saúde.'
      ],
      explicacao: 'Com voluntários nas comunidades, a Pastoral da Criança ajudou a reduzir a mortalidade infantil no Brasil. Zilda Arns morreu em 2010, no terremoto do Haiti, onde estava em missão.'
    },
    {
      id: 'so-d4', tema: 'solidariedade', nivel: 'dificil',
      pergunta: 'O Dia Internacional do Voluntário, criado pela ONU, é comemorado em...',
      certa: '5 de dezembro.',
      erradas: [
        '1º de janeiro.',
        '21 de abril.',
        '7 de setembro.',
        '25 de dezembro.'
      ],
      explicacao: 'A data foi criada pela ONU em 1985 para reconhecer quem doa o seu tempo para ajudar os outros.'
    },
    {
      id: 'so-d5', tema: 'solidariedade', nivel: 'dificil',
      pergunta: 'Uma cooperativa é um exemplo de economia solidária porque...',
      certa: 'Os trabalhadores são donos juntos e dividem os resultados.',
      erradas: [
        'Um único dono fica com todo o lucro que a empresa tiver.',
        'Os trabalhadores não podem dar nenhuma opinião sobre o trabalho.',
        'Ela só existe para derrubar e quebrar as outras empresas.',
        'Ninguém recebe nada pelo trabalho que faz durante o mês.'
      ],
      explicacao: 'Em uma cooperativa, como as de catadores de recicláveis, cada membro tem voz, as decisões são tomadas juntas e o resultado é dividido entre todos.'
    }
  ];

  if (typeof module !== 'undefined' && module.exports) module.exports = PERGUNTAS;
  else root.PERGUNTAS_TABULEIRO = PERGUNTAS;
})(typeof self !== 'undefined' ? self : this);
