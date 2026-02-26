export interface BNCCSkill {
  codigo: string;
  descricao: string;
  eixo: 'Pensamento Computacional' | 'Mundo Digital' | 'Cultura Digital';
  ano: string;
}

export const bnccSkills: BNCCSkill[] = [
  // 1º Ano
  { codigo: 'EF01CO01', eixo: 'Pensamento Computacional', ano: '1º Ano', descricao: 'Organizar objetos físicos ou digitais considerando diferentes características para esta organização, explicitando semelhanças (padrões) e diferenças.' },
  { codigo: 'EF01CO02', eixo: 'Pensamento Computacional', ano: '1º Ano', descricao: 'Identificar e seguir sequências de passos aplicados no dia a dia para resolver problemas.' },
  { codigo: 'EF01CO03', eixo: 'Pensamento Computacional', ano: '1º Ano', descricao: 'Reorganizar e criar sequências de passos em meios físicos ou digitais, relacionando essas sequências à palavra ‘Algoritmos’.' },
  { codigo: 'EF01CO04', eixo: 'Mundo Digital', ano: '1º Ano', descricao: 'Reconhecer o que é a informação, que ela pode ser armazenada, transmitida como mensagem por diversos meios e descrita em várias linguagens.' },
  { codigo: 'EF01CO05', eixo: 'Mundo Digital', ano: '1º Ano', descricao: 'Representar informação usando diferentes codificações.' },
  { codigo: 'EF01CO06', eixo: 'Cultura Digital', ano: '1º Ano', descricao: 'Reconhecer e explorar artefatos computacionais voltados a atender necessidades pessoais ou coletivas.' },
  { codigo: 'EF01CO07', eixo: 'Cultura Digital', ano: '1º Ano', descricao: 'Conhecer as possibilidades de uso seguro das tecnologias computacionais para proteção dos dados pessoais e para garantir a própria segurança.' },

  // 2º Ano
  { codigo: 'EF02CO01', eixo: 'Pensamento Computacional', ano: '2º Ano', descricao: 'Criar e comparar modelos (representações) de objetos, identificando padrões e atributos essenciais.' },
  { codigo: 'EF02CO02', eixo: 'Pensamento Computacional', ano: '2º Ano', descricao: 'Criar e simular algoritmos representados em linguagem oral, escrita ou pictográfica, construídos como sequências com repetições simples.' },
  { codigo: 'EF02CO03', eixo: 'Mundo Digital', ano: '2º Ano', descricao: 'Identificar que máquinas diferentes executam conjuntos próprios de instruções e que podem ser usadas para definir algoritmos.' },
  { codigo: 'EF02CO04', eixo: 'Mundo Digital', ano: '2º Ano', descricao: 'Diferenciar componentes físicos (hardware) e programas que fornecem as instruções (software) para o hardware.' },
  { codigo: 'EF02CO05', eixo: 'Cultura Digital', ano: '2º Ano', descricao: 'Reconhecer as características e usos das tecnologias computacionais no cotidiano dentro e fora da escola.' },
  { codigo: 'EF02CO06', eixo: 'Cultura Digital', ano: '2º Ano', descricao: 'Reconhecer os cuidados com a segurança no uso de dispositivos computacionais.' },

  // 3º Ano
  { codigo: 'EF03CO01', eixo: 'Pensamento Computacional', ano: '3º Ano', descricao: 'Associar os valores \'verdadeiro\' e \'falso\' a sentenças lógicas que dizem respeito a situações do dia a dia.' },
  { codigo: 'EF03CO02', eixo: 'Pensamento Computacional', ano: '3º Ano', descricao: 'Criar e simular algoritmos representados em linguagem oral, escrita ou pictográfica, que incluam sequências e repetições simples com condição.' },
  { codigo: 'EF03CO03', eixo: 'Pensamento Computacional', ano: '3º Ano', descricao: 'Aplicar a estratégia de decomposição para resolver problemas complexos.' },
  { codigo: 'EF03CO04', eixo: 'Mundo Digital', ano: '3º Ano', descricao: 'Relacionar o conceito de informação com o de dado.' },
  { codigo: 'EF03CO05', eixo: 'Mundo Digital', ano: '3º Ano', descricao: 'Compreender que dados são estruturados em formatos específicos dependendo da informação armazenada.' },
  { codigo: 'EF03CO06', eixo: 'Mundo Digital', ano: '3º Ano', descricao: 'Reconhecer que, para um computador realizar tarefas, ele se comunica com o mundo exterior com o uso de interfaces físicas.' },
  { codigo: 'EF03CO07', eixo: 'Cultura Digital', ano: '3º Ano', descricao: 'Utilizar diferentes navegadores e ferramentas de busca para pesquisar e acessar informações.' },
  { codigo: 'EF03CO08', eixo: 'Cultura Digital', ano: '3º Ano', descricao: 'Usar ferramentas computacionais em situações didáticas para se expressar em diferentes formatos digitais.' },
  { codigo: 'EF03CO09', eixo: 'Cultura Digital', ano: '3º Ano', descricao: 'Reconhecer o potencial impacto do compartilhamento de informações pessoais ou de seus pares em meio digital.' },

  // 4º Ano
  { codigo: 'EF04CO01', eixo: 'Pensamento Computacional', ano: '4º Ano', descricao: 'Reconhecer objetos do mundo real e/ou digital que podem ser representados através de matrizes.' },
  { codigo: 'EF04CO02', eixo: 'Pensamento Computacional', ano: '4º Ano', descricao: 'Reconhecer objetos do mundo real e/ou digital que podem ser representados através de registros.' },
  { codigo: 'EF04CO03', eixo: 'Pensamento Computacional', ano: '4º Ano', descricao: 'Criar e simular algoritmos representados em linguagem oral, escrita ou pictográfica, que incluam sequências e repetições simples e aninhadas.' },
  { codigo: 'EF04CO04', eixo: 'Mundo Digital', ano: '4º Ano', descricao: 'Entender que para guardar, manipular e transmitir dados deve-se codificá-los de alguma forma que seja compreendida pela máquina.' },
  { codigo: 'EF04CO05', eixo: 'Mundo Digital', ano: '4º Ano', descricao: 'Codificar diferentes informações para representação em computador (binária, ASCII, atributos de pixel, como RGB etc.).' },
  { codigo: 'EF04CO06', eixo: 'Cultura Digital', ano: '4º Ano', descricao: 'Usar diferentes ferramentas computacionais para criação de conteúdo (textos, apresentações, vídeos etc.).' },
  { codigo: 'EF04CO07', eixo: 'Cultura Digital', ano: '4º Ano', descricao: 'Demonstrar postura ética nas atividades de coleta, transferência, guarda e uso de dados.' },
  { codigo: 'EF04CO08', eixo: 'Cultura Digital', ano: '4º Ano', descricao: 'Reconhecer a importância de verificar a confiabilidade das fontes de informações obtidas na Internet.' },

  // 5º Ano
  { codigo: 'EF05CO01', eixo: 'Pensamento Computacional', ano: '5º Ano', descricao: 'Reconhecer objetos do mundo real e/ou digital que podem ser representados através de listas.' },
  { codigo: 'EF05CO02', eixo: 'Pensamento Computacional', ano: '5º Ano', descricao: 'Reconhecer objetos do mundo real e digital que podem ser representados através de grafos.' },
  { codigo: 'EF05CO03', eixo: 'Pensamento Computacional', ano: '5º Ano', descricao: 'Realizar operações de negação, conjunção e disjunção sobre sentenças lógicas e valores \'verdadeiro\' e \'falso\'.' },
  { codigo: 'EF05CO04', eixo: 'Pensamento Computacional', ano: '5º Ano', descricao: 'Criar e simular algoritmos representados em linguagem oral, escrita ou pictográfica, que incluam sequências, repetições e seleções condicionais.' },
  { codigo: 'EF05CO05', eixo: 'Mundo Digital', ano: '5º Ano', descricao: 'Identificar os componentes principais de um computador (dispositivos de entrada/saída, processadores e armazenamento).' },
  { codigo: 'EF05CO06', eixo: 'Mundo Digital', ano: '5º Ano', descricao: 'Reconhecer que os dados podem ser armazenados em um dispositivo local ou remoto.' },
  { codigo: 'EF05CO07', eixo: 'Mundo Digital', ano: '5º Ano', descricao: 'Reconhecer a necessidade de um sistema operacional para a execução de programas e gerenciamento do hardware.' },
  { codigo: 'EF05CO08', eixo: 'Cultura Digital', ano: '5º Ano', descricao: 'Acessar as informações na Internet de forma crítica para distinguir os conteúdos confiáveis de não confiáveis.' },
  { codigo: 'EF05CO09', eixo: 'Cultura Digital', ano: '5º Ano', descricao: 'Usar informações considerando aplicações e limites dos direitos autorais em diferentes mídias digitais.' },
  { codigo: 'EF05CO10', eixo: 'Cultura Digital', ano: '5º Ano', descricao: 'Expressar-se crítica e criativamente na compreensão das mudanças tecnológicas no mundo do trabalho e sobre a evolução da sociedade.' },
  { codigo: 'EF05CO11', eixo: 'Cultura Digital', ano: '5º Ano', descricao: 'Identificar a adequação de diferentes tecnologias computacionais na resolução de problemas.' },

  // 6º Ano
  { codigo: 'EF06CO01', eixo: 'Pensamento Computacional', ano: '6º Ano', descricao: 'Classificar informações, agrupando-as em coleções (conjuntos) e associando cada coleção a um ‘tipo de dados’.' },
  { codigo: 'EF06CO02', eixo: 'Pensamento Computacional', ano: '6º Ano', descricao: 'Elaborar algoritmos que envolvam instruções sequenciais, de repetição e de seleção usando uma linguagem de programação.' },
  { codigo: 'EF06CO03', eixo: 'Pensamento Computacional', ano: '6º Ano', descricao: 'Descrever com precisão a solução de um problema, construindo o programa que implementa a solução descrita.' },
  { codigo: 'EF06CO04', eixo: 'Pensamento Computacional', ano: '6º Ano', descricao: 'Construir soluções de problemas usando a técnica de decomposição e automatizar tais soluções usando uma linguagem de programação.' },
  { codigo: 'EF06CO05', eixo: 'Pensamento Computacional', ano: '6º Ano', descricao: 'Identificar os recursos ou insumos necessários (entradas) para a resolução de problemas.' },
  { codigo: 'EF06CO06', eixo: 'Pensamento Computacional', ano: '6º Ano', descricao: 'Comparar diferentes casos particulares (instâncias) de um mesmo problema.' },
  { codigo: 'EF06CO07', eixo: 'Mundo Digital', ano: '6º Ano', descricao: 'Entender o processo de transmissão de dados, como a informação é quebrada em pedaços.' },
  { codigo: 'EF06CO08', eixo: 'Mundo Digital', ano: '6º Ano', descricao: 'Compreender e utilizar diferentes formas de armazenar, manipular, compactar e recuperar arquivos.' },
  { codigo: 'EF06CO09', eixo: 'Cultura Digital', ano: '6º Ano', descricao: 'Apresentar conduta e linguagem apropriadas ao se comunicar em ambiente digital.' },
  { codigo: 'EF06CO10', eixo: 'Cultura Digital', ano: '6º Ano', descricao: 'Analisar o consumo de tecnologia na sociedade, compreendendo criticamente o caminho da produção dos recursos.' },

  // 7º Ano
  { codigo: 'EF07CO01', eixo: 'Pensamento Computacional', ano: '7º Ano', descricao: 'Criar soluções de problemas para os quais seja adequado o uso de registros e matrizes unidimensionais.' },
  { codigo: 'EF07CO02', eixo: 'Pensamento Computacional', ano: '7º Ano', descricao: 'Analisar programas para detectar e remover erros.' },
  { codigo: 'EF07CO03', eixo: 'Pensamento Computacional', ano: '7º Ano', descricao: 'Construir soluções computacionais de problemas de diferentes áreas do conhecimento.' },
  { codigo: 'EF07CO04', eixo: 'Pensamento Computacional', ano: '7º Ano', descricao: 'Explorar propriedades básicas de grafos.' },
  { codigo: 'EF07CO05', eixo: 'Pensamento Computacional', ano: '7º Ano', descricao: 'Criar algoritmos fazendo uso da decomposição e do reúso.' },
  { codigo: 'EF07CO06', eixo: 'Mundo Digital', ano: '7º Ano', descricao: 'Compreender o papel de protocolos para a transmissão de dados.' },
  { codigo: 'EF07CO07', eixo: 'Mundo Digital', ano: '7º Ano', descricao: 'Identificar problemas de segurança cibernética e experimentar formas de proteção.' },
  { codigo: 'EF07CO08', eixo: 'Cultura Digital', ano: '7º Ano', descricao: 'Demonstrar empatia sobre opiniões divergentes na web.' },
  { codigo: 'EF07CO09', eixo: 'Cultura Digital', ano: '7º Ano', descricao: 'Reconhecer e debater sobre cyberbullying.' },
  { codigo: 'EF07CO10', eixo: 'Cultura Digital', ano: '7º Ano', descricao: 'Identificar os impactos ambientais do descarte de peças de computadores.' },
  { codigo: 'EF07CO11', eixo: 'Cultura Digital', ano: '7º Ano', descricao: 'Criar, documentar e publicar produtos (vídeos, podcasts, web sites) usando recursos de tecnologia.' },

  // 8º Ano
  { codigo: 'EF08CO01', eixo: 'Pensamento Computacional', ano: '8º Ano', descricao: 'Construir soluções de problemas usando a técnica de recursão.' },
  { codigo: 'EF08CO02', eixo: 'Pensamento Computacional', ano: '8º Ano', descricao: 'Criar soluções de problemas para os quais seja adequado o uso de listas.' },
  { codigo: 'EF08CO03', eixo: 'Pensamento Computacional', ano: '8º Ano', descricao: 'Utilizar algoritmos clássicos de manipulação sobre listas.' },
  { codigo: 'EF08CO04', eixo: 'Pensamento Computacional', ano: '8º Ano', descricao: 'Construir soluções computacionais de problemas de diferentes áreas do conhecimento.' },
  { codigo: 'EF08CO05', eixo: 'Mundo Digital', ano: '8º Ano', descricao: 'Compreender os conceitos de paralelismo, concorrência e armazenamento/processamento distribuídos.' },
  { codigo: 'EF08CO06', eixo: 'Mundo Digital', ano: '8º Ano', descricao: 'Entender como é a estrutura e funcionamento da internet.' },
  { codigo: 'EF08CO07', eixo: 'Cultura Digital', ano: '8º Ano', descricao: 'Compartilhar informações por meio de redes sociais de forma responsável.' },
  { codigo: 'EF08CO08', eixo: 'Cultura Digital', ano: '8º Ano', descricao: 'Distinguir os tipos de dados pessoais que são solicitados em espaços digitais.' },
  { codigo: 'EF08CO09', eixo: 'Cultura Digital', ano: '8º Ano', descricao: 'Analisar criticamente as políticas de termos de uso das redes sociais.' },
  { codigo: 'EF08CO10', eixo: 'Cultura Digital', ano: '8º Ano', descricao: 'Discutir questões sobre segurança e privacidade relacionadas ao uso dos ambientes virtuais.' },
  { codigo: 'EF08CO11', eixo: 'Cultura Digital', ano: '8º Ano', descricao: 'Avaliar a precisão, relevância, adequação, abrangência e vieses em fontes de informação eletrônica.' },

  // 9º Ano
  { codigo: 'EF09CO01', eixo: 'Pensamento Computacional', ano: '9º Ano', descricao: 'Criar soluções de problemas para os quais seja adequado o uso de árvores e grafos.' },
  { codigo: 'EF09CO02', eixo: 'Pensamento Computacional', ano: '9º Ano', descricao: 'Construir soluções computacionais de problemas de diferentes áreas do conhecimento.' },
  { codigo: 'EF09CO03', eixo: 'Pensamento Computacional', ano: '9º Ano', descricao: 'Usar autômatos para descrever comportamentos de forma abstrata.' },
  { codigo: 'EF09CO04', eixo: 'Mundo Digital', ano: '9º Ano', descricao: 'Compreender o funcionamento de malwares e outros ataques cibernéticos.' },
  { codigo: 'EF09CO05', eixo: 'Mundo Digital', ano: '9º Ano', descricao: 'Analisar técnicas de criptografia para armazenamento e transmissão de dados.' },
  { codigo: 'EF09CO06', eixo: 'Cultura Digital', ano: '9º Ano', descricao: 'Analisar problemas sociais de sua cidade e estado a partir de ambientes digitais.' },
  { codigo: 'EF09CO07', eixo: 'Cultura Digital', ano: '9º Ano', descricao: 'Avaliar aplicações e implicações políticas, socioambientais e culturais das tecnologias digitais.' },
  { codigo: 'EF09CO08', eixo: 'Cultura Digital', ano: '9º Ano', descricao: 'Discutir como a distribuição desigual de recursos de computação levanta questões de equidade.' },
  { codigo: 'EF09CO09', eixo: 'Cultura Digital', ano: '9º Ano', descricao: 'Criar ou utilizar conteúdo em meio digital, compreendendo questões éticas relacionadas a direitos autorais.' },
  { codigo: 'EF09CO10', eixo: 'Cultura Digital', ano: '9º Ano', descricao: 'Avaliar a veracidade, credibilidade e relevância da informação em seus diferentes formatos.' },
];
