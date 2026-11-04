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
 * As perguntas de juros simples não ficam aqui: o app.js gera as contas sozinho.
 * Depois de mudar este arquivo, rode "node test.js" para conferir se está tudo certo.
 */
(function (root) {
  'use strict';

  const PERGUNTAS = [

    /* ==================== CIDADE FRATERNA ==================== */

    {
      id: 'fr-f1', tema: 'fraterna', nivel: 'facil',
      pergunta: 'O que é uma cidade fraterna?',
      certa: 'Uma cidade onde as pessoas cuidam umas das outras e todos têm o básico para viver bem.',
      erradas: [
        'Uma cidade onde só quem tem dinheiro consegue morar bem.',
        'Uma cidade cheia de prédios altos e shoppings.',
        'Uma cidade onde cada um cuida só da própria vida.'
      ],
      explicacao: '"Fraterno" vem de irmão. Na cidade fraterna as pessoas se tratam como irmãs e lutam para que todos tenham moradia, saúde, escola e lazer.'
    },
    {
      id: 'fr-f2', tema: 'fraterna', nivel: 'facil',
      pergunta: 'Para que servem as praças e os parques de uma cidade?',
      certa: 'Para todas as pessoas se encontrarem, brincarem e descansarem, de graça.',
      erradas: [
        'Para jogar o lixo da cidade.',
        'Só para quem mora bem em frente a eles.',
        'Para estacionar carros.'
      ],
      explicacao: 'Praças e parques são espaços públicos: são de todos. Neles a vizinhança convive, faz exercício e tem lazer sem pagar nada.'
    },
    {
      id: 'fr-f3', tema: 'fraterna', nivel: 'facil',
      pergunta: 'Na sua rua, um vizinho idoso mora sozinho e está doente. Qual atitude combina com uma cidade fraterna?',
      certa: 'Perguntar se ele precisa de ajuda, como ir à farmácia ou ao mercado.',
      erradas: [
        'Não se meter, porque o problema não é seu.',
        'Reclamar do barulho da televisão dele.',
        'Esperar que alguém da prefeitura apareça um dia.'
      ],
      explicacao: 'Pequenas atitudes de cuidado com quem está perto deixam a cidade mais fraterna. Quem está sozinho e doente precisa de uma rede de apoio.'
    },
    {
      id: 'fr-f4', tema: 'fraterna', nivel: 'facil',
      pergunta: 'Uma calçada com rampa, sem buracos e com piso tátil ajuda...',
      certa: 'Pessoas com deficiência, idosos e quem empurra carrinho de bebê; no fim, ajuda todo mundo.',
      erradas: [
        'Só os carros que estacionam na rua.',
        'Apenas os atletas que correm na rua.',
        'Ninguém: é só um enfeite.'
      ],
      explicacao: 'Isso é acessibilidade: pensar a cidade para todas as pessoas. Rampas e piso tátil garantem o direito de ir e vir de quem tem mais dificuldade para andar ou enxergar.'
    },
    {
      id: 'fr-f5', tema: 'fraterna', nivel: 'facil',
      pergunta: 'Jogar lixo na rua prejudica a cidade porque...',
      certa: 'Entope bueiros, causa alagamentos e atrai ratos e insetos.',
      erradas: [
        'Deixa a rua mais bonita e colorida.',
        'Ajuda as plantas a crescerem mais rápido.',
        'Não prejudica: a chuva leva tudo embora.'
      ],
      explicacao: 'O lixo da rua vai parar nos bueiros e nos rios. Com a chuva, a água não escoa e alaga as casas, muitas vezes justamente nos bairros mais pobres.'
    },

    {
      id: 'fr-m1', tema: 'fraterna', nivel: 'medio',
      pergunta: 'Os catadores de materiais recicláveis são importantes para a cidade porque...',
      certa: 'Tiram toneladas de lixo das ruas e devolvem materiais para a reciclagem.',
      erradas: [
        'Aumentam a quantidade de lixo nos rios.',
        'Fazem um trabalho que não serve para nada.',
        'Recolhem só o lixo das casas mais ricas.'
      ],
      explicacao: 'Os catadores, muitas vezes organizados em cooperativas, fazem um serviço ambiental enorme. Eles merecem respeito e condições dignas de trabalho.'
    },
    {
      id: 'fr-m2', tema: 'fraterna', nivel: 'medio',
      pergunta: 'Em uma cidade fraterna, o transporte público deve...',
      certa: 'Chegar a todos os bairros, inclusive os mais afastados, com um preço que as pessoas consigam pagar.',
      erradas: [
        'Atender só o centro da cidade, onde estão as lojas.',
        'Ser bem caro, para ter menos passageiros.',
        'Parar de funcionar nos fins de semana e feriados.'
      ],
      explicacao: 'Desde 2015 o transporte é um direito social na Constituição (art. 6º). Sem ônibus, quem mora longe fica sem acesso ao trabalho, à escola e à saúde.'
    },
    {
      id: 'fr-m3', tema: 'fraterna', nivel: 'medio',
      pergunta: 'Um bairro transforma um terreno abandonado em uma horta comunitária. Qual é o principal ganho para a vizinhança?',
      certa: 'Comida saudável, um terreno bem cuidado e mais convivência entre os vizinhos.',
      erradas: [
        'Mais lixo e mais mosquitos no bairro.',
        'Uma pessoa só fica com tudo o que for plantado.',
        'O terreno fica fechado para sempre.'
      ],
      explicacao: 'Terreno abandonado junta lixo e bichos. A horta comunitária cuida do espaço, produz alimento e aproxima as pessoas.'
    },
    {
      id: 'fr-m4', tema: 'fraterna', nivel: 'medio',
      pergunta: 'Qual destas é uma forma de o morador participar das decisões da cidade?',
      certa: 'Ir a audiências públicas e conselhos para dar opinião sobre o bairro.',
      erradas: [
        'Pichar os muros da prefeitura.',
        'Nunca votar nem dar opinião sobre nada.',
        'Mudar de cidade sempre que algo dá errado.'
      ],
      explicacao: 'Conselhos, audiências públicas e o orçamento participativo são espaços em que a população ajuda a decidir o que a cidade vai fazer.'
    },
    {
      id: 'fr-m5', tema: 'fraterna', nivel: 'medio',
      pergunta: 'Uma família de outro país chega à sua cidade fugindo de uma guerra. Qual atitude é de uma cidade fraterna?',
      certa: 'Acolher a família e ajudar com escola, saúde e documentos.',
      erradas: [
        'Rir do sotaque das crianças na escola.',
        'Exigir que voltem para o país de onde vieram.',
        'Ignorar a família, porque ela não é daqui.'
      ],
      explicacao: 'Acolher refugiados e migrantes é um gesto de fraternidade. No Brasil, eles têm direito à escola pública e ao SUS, como qualquer pessoa.'
    },

    {
      id: 'fr-d1', tema: 'fraterna', nivel: 'dificil',
      pergunta: 'Qual lei federal, de 2001, traz regras para que a cidade cumpra a sua função social?',
      certa: 'O Estatuto da Cidade (Lei 10.257/2001).',
      erradas: [
        'O Estatuto da Criança e do Adolescente.',
        'O Código de Trânsito Brasileiro.',
        'A Lei de Diretrizes e Bases da Educação.',
        'O Código de Defesa do Consumidor.'
      ],
      explicacao: 'O Estatuto da Cidade regulamenta os artigos 182 e 183 da Constituição e traz ferramentas para que a cidade seja de todos, como o Plano Diretor.'
    },
    {
      id: 'fr-d2', tema: 'fraterna', nivel: 'dificil',
      pergunta: 'Pela Constituição, o Plano Diretor é obrigatório para cidades com mais de...',
      certa: '20 mil habitantes.',
      erradas: [
        '500 habitantes.',
        '1 milhão de habitantes.',
        '5 milhões de habitantes.',
        'Nenhuma cidade: ele é opcional.'
      ],
      explicacao: 'O artigo 182 da Constituição exige o Plano Diretor, aprovado pela Câmara Municipal, nas cidades com mais de 20 mil habitantes. É ele que organiza o crescimento da cidade.'
    },
    {
      id: 'fr-d3', tema: 'fraterna', nivel: 'dificil',
      pergunta: 'Um terreno no centro fica vazio por anos, só esperando valorizar, enquanto muitas famílias não têm onde morar. Depois de avisar o dono, a prefeitura pode...',
      certa: 'Cobrar um IPTU cada vez mais alto (IPTU progressivo no tempo) até o terreno ser usado.',
      erradas: [
        'Proibir as famílias sem casa de morar na cidade.',
        'Dar o terreno de presente para uma empresa.',
        'Transformar o terreno em um lixão.',
        'Nada: terreno vazio sempre cumpre a sua função social.'
      ],
      explicacao: 'Imóvel parado só para especular não cumpre a função social da propriedade. O Estatuto da Cidade permite à prefeitura aplicar o IPTU progressivo no tempo.'
    },
    {
      id: 'fr-d4', tema: 'fraterna', nivel: 'dificil',
      pergunta: 'O que significa dizer que a propriedade deve cumprir a sua "função social"?',
      certa: 'Que o uso de um imóvel deve trazer benefício também para a sociedade, e não só para o dono.',
      erradas: [
        'Que todo imóvel deve pertencer ao governo.',
        'Que o dono pode fazer o que quiser, mesmo prejudicando os outros.',
        'Que os imóveis só podem ser usados para comércio.',
        'Que só pode ter casa quem nasceu na cidade.'
      ],
      explicacao: 'A Constituição garante o direito de propriedade, mas diz que ela deve atender à sua função social (art. 5º, inciso XXIII).'
    },
    {
      id: 'fr-d5', tema: 'fraterna', nivel: 'dificil',
      pergunta: 'Qual é a norma técnica brasileira com as regras de acessibilidade em prédios, calçadas e espaços públicos?',
      certa: 'ABNT NBR 9050.',
      erradas: [
        'Lei Áurea.',
        'ISO 9001.',
        'Código Florestal.',
        'Lei do Inquilinato.'
      ],
      explicacao: 'A NBR 9050 define medidas de rampas, corrimãos, banheiros adaptados, piso tátil e muito mais, para que todas as pessoas possam usar a cidade.'
    },

    /* ==================== MORADIAS POPULARES ==================== */

    {
      id: 'mo-f1', tema: 'moradia', nivel: 'facil',
      pergunta: 'O que é uma moradia popular?',
      certa: 'Uma casa feita para famílias de baixa renda, com preço ou parcelas que elas conseguem pagar.',
      erradas: [
        'Uma mansão famosa que aparece na televisão.',
        'Uma casa de praia para passar as férias.',
        'Um prédio comercial cheio de lojas.'
      ],
      explicacao: 'Moradias populares (ou habitação de interesse social) são feitas para que famílias que ganham pouco tenham uma casa digna.'
    },
    {
      id: 'mo-f2', tema: 'moradia', nivel: 'facil',
      pergunta: 'Ter uma casa digna para morar é...',
      certa: 'Um direito de todas as pessoas.',
      erradas: [
        'Um prêmio só para quem tira boas notas.',
        'Um luxo que só os ricos merecem.',
        'Um assunto que não importa para a cidade.'
      ],
      explicacao: 'A moradia é um direito social garantido pela Constituição brasileira (art. 6º) e pela Declaração Universal dos Direitos Humanos.'
    },
    {
      id: 'mo-f3', tema: 'moradia', nivel: 'facil',
      pergunta: 'O que é um mutirão de construção?',
      certa: 'Quando vizinhos e voluntários se juntam para construir ou reformar casas.',
      erradas: [
        'Uma briga entre vizinhos por causa do muro.',
        'Um tipo de tijolo muito caro.',
        'Uma loja que vende material de construção.'
      ],
      explicacao: 'No mutirão, cada um ajuda um pouco e a obra anda rápido. Muitos bairros populares foram construídos assim.'
    },
    {
      id: 'mo-f4', tema: 'moradia', nivel: 'facil',
      pergunta: 'Uma moradia digna precisa ter...',
      certa: 'Água limpa, banheiro, energia elétrica e um lugar seguro para dormir.',
      erradas: [
        'Piscina e churrasqueira.',
        'Uma televisão em cada cômodo.',
        'Garagem para dois carros.'
      ],
      explicacao: 'Moradia digna não é luxo: é ter o básico para viver com saúde e segurança.'
    },
    {
      id: 'mo-f5', tema: 'moradia', nivel: 'facil',
      pergunta: 'Muitas famílias moram em casas muito pequenas e sem conforto. Isso acontece principalmente porque...',
      certa: 'Elas ganham pouco, e os aluguéis e as casas são caros.',
      erradas: [
        'Elas gostam de morar em lugares apertados.',
        'É proibido construir casas grandes.',
        'Todas as casas do Brasil são pequenas.'
      ],
      explicacao: 'Quando o salário é baixo e a moradia é cara, a família mora onde consegue pagar, mesmo sem conforto.'
    },

    {
      id: 'mo-m1', tema: 'moradia', nivel: 'medio',
      pergunta: 'O que é o déficit habitacional?',
      certa: 'A falta de moradias adequadas para as famílias que precisam.',
      erradas: [
        'O número de casas de praia vazias.',
        'O valor do aluguel de um apartamento.',
        'A quantidade de prédios altos de uma cidade.'
      ],
      explicacao: 'O déficit conta as famílias sem moradia adequada: casas precárias, famílias dividindo a mesma casa ou aluguel caro demais. No Brasil, faltam cerca de 6 milhões de moradias.'
    },
    {
      id: 'mo-m2', tema: 'moradia', nivel: 'medio',
      pergunta: 'O que é o aluguel social?',
      certa: 'Um auxílio por um tempo para pagar o aluguel de famílias que perderam a casa, como em enchentes ou desabamentos.',
      erradas: [
        'Um aluguel cobrado para fazer festas no bairro.',
        'Uma multa para quem atrasa o aluguel.',
        'Um aluguel mais caro para quem ganha pouco.'
      ],
      explicacao: 'O aluguel social é pago pela prefeitura ou pelo estado enquanto a família espera uma moradia definitiva.'
    },
    {
      id: 'mo-m3', tema: 'moradia', nivel: 'medio',
      pergunta: 'Uma família gasta mais da metade do que ganha só com o aluguel. Qual é o problema?',
      certa: 'Sobra pouco dinheiro para comida, saúde, transporte e outras necessidades.',
      erradas: [
        'Nenhum: aluguel caro sempre significa casa boa.',
        'A família fica mais rica no fim do mês.',
        'O dono da casa é obrigado a devolver o dinheiro.'
      ],
      explicacao: 'Quando o aluguel pesa demais (mais de 30% da renda das famílias mais pobres), isso se chama ônus excessivo com aluguel e entra na conta do déficit habitacional.'
    },
    {
      id: 'mo-m4', tema: 'moradia', nivel: 'medio',
      pergunta: 'Qual programa do governo federal, criado em 2009, ajuda famílias de baixa renda a ter a casa própria?',
      certa: 'Minha Casa, Minha Vida.',
      erradas: [
        'Mais Médicos.',
        'Bolsa Atleta.',
        'Luz para Todos.',
        'Pé-de-Meia.'
      ],
      explicacao: 'O Minha Casa, Minha Vida financia moradias com parcelas menores, de acordo com a renda da família.'
    },
    {
      id: 'mo-m5', tema: 'moradia', nivel: 'medio',
      pergunta: 'Por que não basta construir moradias populares muito longe, sem ônibus, escola ou posto de saúde por perto?',
      certa: 'Porque a família ganha a casa, mas perde o acesso a trabalho, estudo e saúde.',
      erradas: [
        'Porque casas longe do centro são sempre maiores.',
        'Porque ninguém gosta de lugares tranquilos.',
        'Na verdade basta: a casa é a única coisa que importa.'
      ],
      explicacao: 'Morar bem é ter casa e também cidade: transporte, escola, saúde e lazer por perto.'
    },

    {
      id: 'mo-d1', tema: 'moradia', nivel: 'dificil',
      pergunta: 'Em que ano a moradia entrou na lista de direitos sociais do artigo 6º da Constituição Federal?',
      certa: 'Em 2000, pela Emenda Constitucional nº 26.',
      erradas: [
        'Em 1500, com a chegada dos portugueses.',
        'Em 1888, com a Lei Áurea.',
        'Em 2020, durante a pandemia.',
        'Nunca: a moradia não está na Constituição.'
      ],
      explicacao: 'A Constituição é de 1988, mas a moradia só foi incluída no art. 6º em 2000. Hoje ela está ao lado da educação, da saúde e da alimentação.'
    },
    {
      id: 'mo-d2', tema: 'moradia', nivel: 'dificil',
      pergunta: 'O que são as ZEIS (Zonas Especiais de Interesse Social)?',
      certa: 'Áreas da cidade reservadas para moradia popular e para melhorar comunidades que já existem.',
      erradas: [
        'Zonas onde é proibido construir casas.',
        'Áreas reservadas só para indústrias.',
        'Bairros exclusivos para condomínios de luxo.',
        'Reservas ambientais onde ninguém pode entrar.'
      ],
      explicacao: 'As ZEIS ficam no Plano Diretor. Elas protegem as comunidades e reservam terrenos bem localizados para habitação de interesse social.'
    },
    {
      id: 'mo-d3', tema: 'moradia', nivel: 'dificil',
      pergunta: 'A regularização fundiária urbana (Reurb) serve para...',
      certa: 'Dar o documento da casa e levar infraestrutura a bairros que cresceram sem regularização.',
      erradas: [
        'Derrubar todas as casas que não têm documento.',
        'Aumentar o preço dos aluguéis.',
        'Proibir novas famílias de morar na cidade.',
        'Transformar bairros em fazendas.'
      ],
      explicacao: 'Com a Reurb (Lei 13.465/2017), as famílias recebem o título da moradia e o bairro ganha água, esgoto, luz e ruas. O documento dá segurança para a família.'
    },
    {
      id: 'mo-d4', tema: 'moradia', nivel: 'dificil',
      pergunta: 'Pela Constituição, quem mora há 5 anos, sem oposição, num terreno urbano de até 250 m² e não tem outro imóvel pode pedir para ser dono dele. Como isso se chama?',
      certa: 'Usucapião especial urbana.',
      erradas: [
        'Despejo.',
        'Herança.',
        'Hipoteca.',
        'Leilão.'
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
      certa: 'Para entrar luz e ar fresco, o que ajuda a evitar mofo e doenças.',
      erradas: [
        'Para os vizinhos verem a televisão.',
        'Só para enfeitar a parede.',
        'Para a casa ficar mais escura.'
      ],
      explicacao: 'A luz do sol e a ventilação secam a umidade, renovam o ar e deixam a casa mais saudável.'
    },
    {
      id: 'qu-f2', tema: 'qualidade', nivel: 'facil',
      pergunta: 'Qual é o jeito certo de guardar água em casa para evitar a dengue?',
      certa: 'Manter a caixa d\'água, os baldes e os tambores sempre tampados.',
      erradas: [
        'Deixar os baldes destampados no quintal.',
        'Guardar água em pneus velhos.',
        'Deixar água parada nos pratinhos das plantas.'
      ],
      explicacao: 'O mosquito Aedes aegypti, que transmite a dengue, põe ovos em água parada. Tampar os recipientes impede isso.'
    },
    {
      id: 'qu-f3', tema: 'qualidade', nivel: 'facil',
      pergunta: 'Para que serve a rede de esgoto?',
      certa: 'Levar a água suja do banheiro e da cozinha para longe das casas, até o tratamento.',
      erradas: [
        'Trazer água limpa para beber.',
        'Levar energia elétrica até as casas.',
        'Guardar o lixo reciclável.'
      ],
      explicacao: 'Sem rede de esgoto, a água suja corre perto das casas e espalha doenças. Com ela, o esgoto vai para uma estação de tratamento.'
    },
    {
      id: 'qu-f4', tema: 'qualidade', nivel: 'facil',
      pergunta: 'Fazer "gato" de energia (ligação improvisada e escondida) é perigoso porque...',
      certa: 'Pode causar choques, curtos-circuitos e incêndios.',
      erradas: [
        'Deixa a luz mais forte e mais segura.',
        'Não tem perigo nenhum.',
        'Faz a casa gastar menos energia.'
      ],
      explicacao: 'Fios mal instalados esquentam e podem pegar fogo. Famílias de baixa renda inscritas no CadÚnico podem ter desconto na conta de luz pela Tarifa Social.'
    },
    {
      id: 'qu-f5', tema: 'qualidade', nivel: 'facil',
      pergunta: 'O que deixa uma casa mais segura para as crianças?',
      certa: 'Tomadas protegidas, fios bem instalados e produtos de limpeza longe do alcance delas.',
      erradas: [
        'Fios soltos espalhados pelo chão.',
        'Remédios guardados em cima da mesa.',
        'Panelas com o cabo virado para fora do fogão.'
      ],
      explicacao: 'Muitos acidentes com crianças acontecem dentro de casa. Pequenos cuidados evitam choques, queimaduras e intoxicações.'
    },

    {
      id: 'qu-m1', tema: 'qualidade', nivel: 'medio',
      pergunta: 'Uma casa com paredes úmidas e cheias de mofo pode causar...',
      certa: 'Doenças respiratórias, como asma, rinite e bronquite.',
      erradas: [
        'Dor de dente.',
        'Mais saúde para quem mora nela.',
        'Fraturas nos ossos.'
      ],
      explicacao: 'O mofo solta no ar partículas que irritam o nariz e os pulmões. Ventilar a casa e impermeabilizar as paredes ajudam a resolver.'
    },
    {
      id: 'qu-m2', tema: 'qualidade', nivel: 'medio',
      pergunta: 'Esgoto correndo a céu aberto perto das casas pode transmitir...',
      certa: 'Doenças como diarreia, hepatite A e verminoses.',
      erradas: [
        'Nenhuma doença, porque a água evapora.',
        'Apenas alergia a pólen de flores.',
        'Só miopia e outros problemas de visão.'
      ],
      explicacao: 'Água contaminada por esgoto espalha micróbios e vermes. Por isso o saneamento básico é tão importante para a saúde.'
    },
    {
      id: 'qu-m3', tema: 'qualidade', nivel: 'medio',
      pergunta: 'Por que é perigoso construir casas em encostas de morro ou na beira de rios?',
      certa: 'Por causa do risco de deslizamento de terra e de enchentes, principalmente nas chuvas.',
      erradas: [
        'Porque a vista é bonita demais.',
        'Porque nesses lugares nunca bate sol.',
        'Não é perigoso: são os lugares mais seguros.'
      ],
      explicacao: 'Muitas famílias moram em áreas de risco por falta de opção. Uma cidade justa oferece moradia segura e faz obras de contenção e drenagem.'
    },
    {
      id: 'qu-m4', tema: 'qualidade', nivel: 'medio',
      pergunta: 'Uma casa de um quarto só, onde dormem 6 pessoas, tem um problema chamado...',
      certa: 'Adensamento excessivo (gente demais por dormitório).',
      erradas: [
        'Excesso de conforto.',
        'Casa de veraneio.',
        'Ventilação cruzada.'
      ],
      explicacao: 'No Brasil, mais de 3 pessoas por dormitório é considerado adensamento excessivo. Isso tira a privacidade, atrapalha o sono e o estudo e facilita a transmissão de doenças.'
    },
    {
      id: 'qu-m5', tema: 'qualidade', nivel: 'medio',
      pergunta: 'Uma casa tem ventilação cruzada quando...',
      certa: 'Há janelas ou portas em lados diferentes, para o ar entrar por um lado e sair pelo outro.',
      erradas: [
        'Tem uma janela pequena só, no banheiro.',
        'O ventilador fica ligado o dia inteiro.',
        'As janelas ficam sempre fechadas.'
      ],
      explicacao: 'Com aberturas em lados opostos, o vento atravessa a casa, renova o ar e diminui o calor e a umidade sem gastar energia.'
    },

    {
      id: 'qu-d1', tema: 'qualidade', nivel: 'dificil',
      pergunta: 'Segundo a Lei do Saneamento Básico (Lei 11.445/2007), o saneamento é formado por...',
      certa: 'Água potável, esgoto, limpeza urbana com manejo do lixo e drenagem da água da chuva.',
      erradas: [
        'Água potável, energia elétrica, internet e gás.',
        'Esgoto, asfalto, iluminação pública e telefone.',
        'Só a água que sai da torneira.',
        'Coleta de lixo e transporte público.'
      ],
      explicacao: 'Os quatro serviços do saneamento básico são: abastecimento de água, esgotamento sanitário, limpeza urbana e manejo de resíduos sólidos, e drenagem das águas da chuva.'
    },
    {
      id: 'qu-d2', tema: 'qualidade', nivel: 'dificil',
      pergunta: 'O Marco Legal do Saneamento, de 2020, tem como meta que até 2033...',
      certa: '99% da população tenha água potável e 90% tenha coleta e tratamento de esgoto.',
      erradas: [
        'Todas as casas do Brasil tenham piscina.',
        'Só metade da população tenha água potável.',
        'O esgoto continue indo direto para os rios.',
        'Só as capitais tenham saneamento.'
      ],
      explicacao: 'A Lei 14.026/2020 fixou essas metas porque milhões de brasileiros ainda vivem sem água tratada ou sem coleta de esgoto.'
    },
    {
      id: 'qu-d3', tema: 'qualidade', nivel: 'dificil',
      pergunta: 'A Tarifa Social de Energia Elétrica dá desconto na conta de luz para...',
      certa: 'Famílias de baixa renda inscritas no Cadastro Único (CadÚnico).',
      erradas: [
        'Quem gasta mais energia no mês.',
        'Empresas grandes e indústrias.',
        'Quem mora em casas de luxo.',
        'Só quem tem placa solar no telhado.'
      ],
      explicacao: 'A tarifa social reduz a conta das famílias mais pobres e ajuda a ter energia segura em casa, sem precisar de "gato".'
    },
    {
      id: 'qu-d4', tema: 'qualidade', nivel: 'dificil',
      pergunta: 'Em enchentes, a água pode transmitir leptospirose. Essa doença vem principalmente...',
      certa: 'Da urina de ratos misturada à água.',
      erradas: [
        'Da picada do mosquito da dengue.',
        'De tomar sol depois da chuva.',
        'Do frio da água da chuva.',
        'De comer frutas bem lavadas.'
      ],
      explicacao: 'A bactéria da leptospirose sai na urina dos ratos. O lixo acumulado atrai ratos e a enchente espalha a bactéria. Por isso é importante evitar contato com a água da enchente.'
    },
    {
      id: 'qu-d5', tema: 'qualidade', nivel: 'dificil',
      pergunta: 'A Lei 11.888/2008 garante às famílias de baixa renda...',
      certa: 'Assistência técnica gratuita de arquitetos e engenheiros para projetar, construir ou reformar a casa.',
      erradas: [
        'Uma casa nova de graça para cada família.',
        'Desconto na compra de carros.',
        'Internet grátis em casa.',
        'Isenção de todas as contas de água.'
      ],
      explicacao: 'Com assistência técnica, a família constrói ou reforma com segurança, sem rachaduras, umidade ou risco de desabar. A lei vale para famílias com renda de até 3 salários mínimos.'
    },

    /* ==================== DESIGUALDADE SOCIAL ==================== */

    {
      id: 'de-f1', tema: 'desigualdade', nivel: 'facil',
      pergunta: 'O que é desigualdade social?',
      certa: 'Quando algumas pessoas têm muito e outras não têm o básico para viver.',
      erradas: [
        'Quando todos ganham exatamente o mesmo salário.',
        'Quando as pessoas gostam de músicas diferentes.',
        'Quando a cidade tem muitos parques.'
      ],
      explicacao: 'Desigualdade social é uma diferença grande de renda e de acesso a direitos, como moradia, saúde e educação.'
    },
    {
      id: 'de-f2', tema: 'desigualdade', nivel: 'facil',
      pergunta: 'Em muitas cidades, os bairros mais pobres ficam longe do centro. Que dificuldade isso traz?',
      certa: 'Os moradores gastam muito tempo e dinheiro com transporte para trabalhar e estudar.',
      erradas: [
        'Nenhuma: longe do centro tudo é mais fácil.',
        'Os moradores ficam mais perto dos empregos.',
        'Os ônibus passam com mais frequência.'
      ],
      explicacao: 'Horas no ônibus todo dia significam menos tempo para estudar, descansar e ficar com a família.'
    },
    {
      id: 'de-f3', tema: 'desigualdade', nivel: 'facil',
      pergunta: 'Comunidades de favela muitas vezes surgem porque...',
      certa: 'Muitas famílias não conseguem pagar por uma moradia formal e constroem onde é possível.',
      erradas: [
        'As pessoas gostam de morar longe de tudo.',
        'O governo obriga as famílias a morar lá.',
        'Lá ficam os terrenos mais caros da cidade.'
      ],
      explicacao: 'Com salários baixos e aluguéis caros, muitas famílias constroem a própria casa onde conseguem. As favelas mostram a força dessas comunidades e também a falta de apoio do poder público.'
    },
    {
      id: 'de-f4', tema: 'desigualdade', nivel: 'facil',
      pergunta: 'Qual atitude ajuda a diminuir a desigualdade?',
      certa: 'Garantir escola de qualidade, saúde e moradia para todos.',
      erradas: [
        'Deixar as escolas só para quem pode pagar.',
        'Rir de quem tem menos.',
        'Proibir crianças pobres de brincar na praça.'
      ],
      explicacao: 'Quando todos têm acesso aos mesmos direitos, as oportunidades ficam mais iguais.'
    },
    {
      id: 'de-f5', tema: 'desigualdade', nivel: 'facil',
      pergunta: 'Tratar alguém mal por causa da roupa que usa ou do bairro onde mora é...',
      certa: 'Preconceito, e isso aumenta a desigualdade.',
      erradas: [
        'Uma brincadeira sem problema nenhum.',
        'Um elogio.',
        'Uma regra da escola.'
      ],
      explicacao: 'O preconceito exclui as pessoas e fecha portas, como vagas de emprego. O respeito é o primeiro passo para uma cidade mais justa.'
    },

    {
      id: 'de-m1', tema: 'desigualdade', nivel: 'medio',
      pergunta: 'Qual situação mostra que uma cidade é desigual?',
      certa: 'Bairros com asfalto, esgoto e parques ao lado de bairros sem saneamento nem lazer.',
      erradas: [
        'Ruas com nomes diferentes umas das outras.',
        'Escolas com uniformes de cores diferentes.',
        'Prédios com alturas diferentes.'
      ],
      explicacao: 'A desigualdade aparece no mapa: alguns bairros recebem muitos serviços públicos e outros quase nenhum.'
    },
    {
      id: 'de-m2', tema: 'desigualdade', nivel: 'medio',
      pergunta: 'Uma criança precisa trabalhar para ajudar em casa e falta à escola. Por que isso é um problema de desigualdade?',
      certa: 'Ela perde a chance de estudar, e isso pode limitar o futuro dela.',
      erradas: [
        'Porque assim ela ganha mais tempo para brincar.',
        'Isso não tem nenhuma relação com desigualdade.',
        'Porque trabalhar cedo é obrigatório no Brasil.'
      ],
      explicacao: 'No Brasil, o trabalho é proibido para menores de 16 anos, a não ser como aprendiz a partir dos 14. A escola é um direito e um caminho para diminuir a desigualdade.'
    },
    {
      id: 'de-m3', tema: 'desigualdade', nivel: 'medio',
      pergunta: 'O IDH (Índice de Desenvolvimento Humano) mede...',
      certa: 'A renda, a educação e a saúde (expectativa de vida) da população.',
      erradas: [
        'Só a quantidade de prédios da cidade.',
        'O número de carros por pessoa.',
        'A altura média das pessoas.'
      ],
      explicacao: 'O IDH vai de 0 a 1. Quanto mais perto de 1, melhores as condições de vida da população.'
    },
    {
      id: 'de-m4', tema: 'desigualdade', nivel: 'medio',
      pergunta: 'O bairro rico tem um parque e o bairro pobre não tem nenhuma praça. Qual seria a decisão mais justa?',
      certa: 'Investir primeiro em lazer e serviços no bairro que tem menos.',
      erradas: [
        'Fazer um segundo parque no bairro rico.',
        'Fechar o parque para todo mundo.',
        'Cobrar entrada no parque.'
      ],
      explicacao: 'Isso é equidade: dar mais para quem tem menos, até que todos tenham as mesmas oportunidades.'
    },
    {
      id: 'de-m5', tema: 'desigualdade', nivel: 'medio',
      pergunta: 'No Censo 2022, o IBGE trocou o nome "aglomerados subnormais" por...',
      certa: 'Favelas e comunidades urbanas.',
      erradas: [
        'Bairros nobres.',
        'Condomínios fechados.',
        'Zonas rurais.'
      ],
      explicacao: 'O IBGE mudou o nome depois de debater com movimentos sociais, para usar palavras que os próprios moradores reconhecem, sem preconceito.'
    },

    {
      id: 'de-d1', tema: 'desigualdade', nivel: 'dificil',
      pergunta: 'O coeficiente de Gini mede a desigualdade de renda. Um país com Gini mais perto de 1 é...',
      certa: 'Mais desigual.',
      erradas: [
        'Mais igualitário.',
        'Mais rico.',
        'Mais populoso.',
        'Mais frio.'
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
      certa: 'Quando um bairro se valoriza, os aluguéis sobem e os moradores mais pobres acabam tendo que sair.',
      erradas: [
        'Quando um bairro fica abandonado e sem moradores.',
        'Quando a prefeitura constrói moradias populares.',
        'Quando os vizinhos se juntam para pintar as casas.',
        'Quando um bairro muda de nome.'
      ],
      explicacao: 'A gentrificação "expulsa" sem despejo: o custo de vida sobe e quem morava ali há anos não consegue mais pagar.'
    },
    {
      id: 'de-d4', tema: 'desigualdade', nivel: 'dificil',
      pergunta: 'Igualdade e equidade são diferentes. Qual exemplo mostra EQUIDADE?',
      certa: 'Dar reforço escolar a quem tem mais dificuldade, para que todos aprendam.',
      erradas: [
        'Dar exatamente a mesma coisa a todos, mesmo que alguns precisem de mais.',
        'Dar mais para quem já tem mais.',
        'Não dar nada para ninguém.',
        'Sortear quem vai receber ajuda.'
      ],
      explicacao: 'Igualdade é tratar todos do mesmo jeito. Equidade é dar a cada um o que precisa para chegar ao mesmo ponto.'
    },
    {
      id: 'de-d5', tema: 'desigualdade', nivel: 'dificil',
      pergunta: 'Por que a falta de saneamento também é um problema de desigualdade?',
      certa: 'Porque falta principalmente nas periferias e comunidades pobres, que adoecem mais e perdem dias de escola e trabalho.',
      erradas: [
        'Porque só os ricos ficam doentes sem esgoto.',
        'Porque o saneamento só é necessário no centro.',
        'Não é: o saneamento chega igual para todos.',
        'Porque o esgoto a céu aberto melhora a saúde.'
      ],
      explicacao: 'As doenças ligadas à falta de saneamento atingem mais quem já tem menos. Levar água e esgoto a todos também é diminuir a desigualdade.'
    },

    /* ==================== SOLIDARIEDADE ==================== */

    {
      id: 'so-f1', tema: 'solidariedade', nivel: 'facil',
      pergunta: 'O que é solidariedade?',
      certa: 'Ajudar e apoiar outras pessoas, principalmente quem está passando por dificuldade.',
      erradas: [
        'Ficar sempre sozinho, sem falar com ninguém.',
        'Ajudar os outros só em troca de dinheiro.',
        'Competir para ser melhor que os outros.'
      ],
      explicacao: 'Ser solidário é sentir que o problema do outro também é nosso e agir para ajudar.'
    },
    {
      id: 'so-f2', tema: 'solidariedade', nivel: 'facil',
      pergunta: 'Um colega perdeu o material escolar numa enchente. Qual atitude é solidária?',
      certa: 'Organizar com a turma uma doação de cadernos e lápis para ele.',
      erradas: [
        'Fingir que não sabe de nada.',
        'Fazer piada sobre o que aconteceu.',
        'Vender um material velho bem caro para ele.'
      ],
      explicacao: 'Quando a turma se une, um problema grande fica pequeno.'
    },
    {
      id: 'so-f3', tema: 'solidariedade', nivel: 'facil',
      pergunta: 'Qual destas é uma forma de ser voluntário?',
      certa: 'Ajudar de graça em uma campanha de arrecadação de alimentos.',
      erradas: [
        'Cobrar para ajudar o vizinho.',
        'Ficar em casa só reclamando.',
        'Jogar lixo na rua.'
      ],
      explicacao: 'Voluntário é quem doa o seu tempo e o seu trabalho para uma causa, sem receber dinheiro.'
    },
    {
      id: 'so-f4', tema: 'solidariedade', nivel: 'facil',
      pergunta: 'O que é empatia?',
      certa: 'Tentar se colocar no lugar do outro para entender o que ele sente.',
      erradas: [
        'Pensar só em si mesmo.',
        'Ficar com raiva de quem é diferente.',
        'Concordar com tudo sem pensar.'
      ],
      explicacao: 'A empatia é o começo da solidariedade: quando entendemos o outro, dá vontade de ajudar.'
    },
    {
      id: 'so-f5', tema: 'solidariedade', nivel: 'facil',
      pergunta: 'Um colega novo chega à escola e não conhece ninguém. O que é mais solidário?',
      certa: 'Convidar o colega para sentar junto e participar das brincadeiras.',
      erradas: [
        'Deixar o colega sozinho no recreio.',
        'Rir dele porque é novo.',
        'Esconder a mochila dele.'
      ],
      explicacao: 'Acolher faz a pessoa se sentir parte do grupo. Ninguém gosta de ficar de fora.'
    },

    {
      id: 'so-m1', tema: 'solidariedade', nivel: 'medio',
      pergunta: 'Ao ajudar uma família que precisa, qual é o jeito mais respeitoso?',
      certa: 'Ajudar sem humilhar e sem expor a família, respeitando a dignidade dela.',
      erradas: [
        'Postar fotos da família nas redes para todo mundo ver.',
        'Ajudar só se ela agradecer em público.',
        'Dar comida vencida, porque ela não vai reclamar.'
      ],
      explicacao: 'Solidariedade de verdade respeita a pessoa ajudada. Ninguém deve ser exposto ou humilhado por precisar de ajuda.'
    },
    {
      id: 'so-m2', tema: 'solidariedade', nivel: 'medio',
      pergunta: 'Por que doar roupas em bom estado é melhor do que doar roupas rasgadas e sujas?',
      certa: 'Porque quem recebe merece usar algo digno, e a doação precisa servir de verdade.',
      erradas: [
        'Porque roupas rasgadas são mais caras.',
        'Não faz diferença nenhuma.',
        'Porque doar é só um jeito de se livrar do que não presta.'
      ],
      explicacao: 'Antes de doar, vale perguntar: "eu usaria isso?". Doação é cuidado com o outro, não descarte.'
    },
    {
      id: 'so-m3', tema: 'solidariedade', nivel: 'medio',
      pergunta: 'Num fim de semana, vizinhos se reúnem para consertar o telhado de uma família. Isso é um exemplo de...',
      certa: 'Mutirão solidário.',
      erradas: [
        'Concorrência.',
        'Despejo.',
        'Especulação imobiliária.'
      ],
      explicacao: 'No mutirão, cada um dá um pouco do seu tempo e do seu talento, e a comunidade resolve o problema junta.'
    },
    {
      id: 'so-m4', tema: 'solidariedade', nivel: 'medio',
      pergunta: 'O que é um banco de alimentos?',
      certa: 'Um lugar que recolhe comida que seria desperdiçada e entrega para quem precisa.',
      erradas: [
        'Um banco onde se guarda dinheiro para comprar comida.',
        'Um banco de praça feito de comida.',
        'Um restaurante só para pessoas ricas.'
      ],
      explicacao: 'Os bancos de alimentos combatem a fome e o desperdício ao mesmo tempo.'
    },
    {
      id: 'so-m5', tema: 'solidariedade', nivel: 'medio',
      pergunta: 'Depois de uma enchente, qual destas doações costuma ser mais útil para as famílias atingidas?',
      certa: 'Água potável, alimentos que não estragam e produtos de limpeza e de higiene.',
      erradas: [
        'Brinquedos quebrados.',
        'Comida que estraga rápido fora da geladeira.',
        'Roupas de festa.'
      ],
      explicacao: 'Quem perdeu tudo precisa primeiro do básico: água, comida e limpeza para voltar para casa com segurança.'
    },

    {
      id: 'so-d1', tema: 'solidariedade', nivel: 'dificil',
      pergunta: 'Herbert de Souza, o Betinho, criou em 1993 uma grande campanha nacional. Qual?',
      certa: 'A Ação da Cidadania contra a Fome, a Miséria e pela Vida.',
      erradas: [
        'A Campanha do Desarmamento.',
        'O programa Bolsa Família.',
        'O Estatuto da Cidade.',
        'O movimento das Diretas Já.'
      ],
      explicacao: 'A campanha do Betinho mobilizou milhões de brasileiros para arrecadar alimentos e mostrou que a fome é um problema de todos.'
    },
    {
      id: 'so-d2', tema: 'solidariedade', nivel: 'dificil',
      pergunta: 'Dar uma cesta básica ajuda hoje. O que torna a solidariedade ainda mais transformadora?',
      certa: 'Além de ajudar agora, unir as pessoas para cobrar soluções para as causas, como emprego e moradia.',
      erradas: [
        'Ajudar uma vez só e nunca mais pensar no assunto.',
        'Ajudar só quem pode devolver o favor depois.',
        'Deixar tudo para o governo e não fazer nada.',
        'Ajudar apenas para aparecer nas redes sociais.'
      ],
      explicacao: 'A ajuda imediata é importante, mas mudar as causas da pobreza é o que evita que o problema volte.'
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
      certa: 'Os trabalhadores são donos juntos, decidem juntos e dividem os resultados.',
      erradas: [
        'Um único dono fica com todo o lucro.',
        'Os trabalhadores não podem dar opinião.',
        'Ela só existe para derrubar as outras empresas.',
        'Ninguém recebe nada pelo trabalho.'
      ],
      explicacao: 'Em uma cooperativa, como as de catadores de recicláveis, cada membro tem voz e o resultado é dividido entre todos.'
    }
  ];

  if (typeof module !== 'undefined' && module.exports) module.exports = PERGUNTAS;
  else root.PERGUNTAS_TABULEIRO = PERGUNTAS;
})(typeof self !== 'undefined' ? self : this);
