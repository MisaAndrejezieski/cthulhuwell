# CthulhuWell

Jogo curto de terror psicológico em primeira pessoa. A câmera olha para a frente: um corredor comprido termina em uma porta. A criatura começa atrás do jogador e só entra em cena quando ele olha para trás.

## Executar

Abra `index.html` em um navegador moderno. Não há dependências, etapa de build ou download de recursos. O áudio começa depois de iniciar a partida, quando o navegador permite áudio após interação.

## Controles

| Tecla | Ação |
| --- | --- |
| `W` | Avançar pelo corredor |
| `Shift` | Correr enquanto avança; consome fôlego |
| `S` | Olhar para trás enquanto estiver pressionada |
| `↑` / `↓` | Inclinar a visão |
| `Esc` | Pausar |
| `Enter` | Continuar a partir da pausa |

O fôlego se recupera ao caminhar ou parar. A porta é a única saída; a criatura alcança o jogador se ele demorar demais.

## Estrutura

```text
index.html    Estrutura semântica da página e elementos da interface
styles.css    Apresentação, layout responsivo e estados da interface
js/game.js    Estado da partida, controles, renderização canvas e áudio
```

O projeto é JavaScript sem módulos externos ou ferramentas de build. `SETTINGS`, no começo de `js/game.js`, concentra as distâncias e velocidades principais para facilitar o ajuste de dificuldade.

## Direção de terror

- **Geografia consistente:** a porta fica no campo de visão frontal. A criatura está atrás e não é desenhada nessa direção; `S` muda a visão para o corredor de trás.
- **Antecipação em vez de sustos constantes:** os passos, a mudança discreta do ambiente sonoro e o aviso breve da interface comunicam aproximação sem mostrar a criatura o tempo todo.
- **Visibilidade limitada:** iluminação fraca, detalhes que desaparecem na distância e vinheta mantêm o corredor legível sem revelar tudo.
- **Escolhas com custo:** caminhar conserva o fôlego; correr ganha distância, mas limita por quanto tempo o jogador pode correr.
- **Som sem arquivos externos:** um grave ambiente, passos do jogador e batidas abafadas da criatura são produzidos com Web Audio após uma interação do jogador. O ritmo das batidas se intensifica conforme ela se aproxima.

## Notas de implementação

- `playerDistance` e `monsterDistance` usam a mesma linha de progresso: ambos diminuem ao se aproximar da porta. A diferença entre eles representa a distância da perseguição.
- A renderização é dividida em corredor, porta, criatura e vinheta. A função de desenho da criatura só é chamada quando a tecla de olhar para trás está pressionada.
- O jogo usa o relógio do `requestAnimationFrame` e limita o delta por quadro para evitar saltos grandes após uma pausa do navegador.
- Os valores de dificuldade ficam agrupados em `SETTINGS`, no início de `js/game.js`.

## Referências consultadas

- Thomas Grip, Frictional Games, [“Alien: Isolation and The Two Hardest Problems in Horror”](https://frictionalgames.com/2014-05-alien-isolation-and-the-two-hardest-problems-in-horror/). Discute como a exposição prolongada torna a criatura familiar e como pistas indiretas podem manter a ameaça na imaginação do jogador. Aplicado ao monstro que só é visto ao olhar para trás e aos sinais sonoros de aproximação.
- Thomas Grip, Frictional Games, [“Thoughts on Alien: Isolation and Horror Simulation”](https://frictionalgames.com/2014-10-thoughts-on-alien-isolation-and-horror-simulation/). Compara mecânicas genéricas com ações que fazem sentido numa história de horror. Aplicado ao objetivo direto de fugir pelo corredor e à decisão de gastar fôlego correndo.
- Thomas Grip, Frictional Games, [“9 Years, 9 Lessons on Horror”](https://frictionalgames.com/2019-10-9-years-9-lessons-on-horror/). Defende construir antecipação, espaçar os sustos e usar sons vagos e contexto para ativar a imaginação do jogador. Aplicado à iluminação limitada, ao grave ambiente e aos passos discretos em vez de sustos sonoros constantes.
