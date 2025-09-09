let personagemSelecionado = null;
let aviaoSelecionado = null;
  
    function selecionar(botao, grupo) {
      const valor = botao.dataset.value; 
      console.log(`Você escolheu: ${valor}`);
  
      grupo.forEach(b => b.classList.remove("selecionado"));
      botao.classList.add("selecionado");
  
      return valor;
    }

  
    
    const botoesPersonagem = document.querySelectorAll(".personagens .escolha");
    botoesPersonagem.forEach(botao => {
      botao.addEventListener("click", () => {
        personagemSelecionado = selecionar(botao, botoesPersonagem);
      });
    });
  
    const botoesAviao = document.querySelectorAll(".avioes .escolha");
    botoesAviao.forEach(botao => {
      botao.addEventListener("click", () => {
        aviaoSelecionado = selecionar(botao, botoesAviao);
      });
    });
  
    const linkPlay = document.getElementById("link-play");
    linkPlay.addEventListener("click", event => {
      if (!personagemSelecionado || !aviaoSelecionado) {
        event.preventDefault(); 
        alert("Escolha um personagem e um avião antes de jogar!");
      } else {
        localStorage.setItem("personagem", personagemSelecionado);
        localStorage.setItem("aviao", aviaoSelecionado);
  
        console.log("Iniciando jogo com:", personagemSelecionado, aviaoSelecionado);
      }
    });
  