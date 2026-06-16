let bancoDeDadosClubes = {};
let timeAtualUsuario = "Manchester City";

// IMPORTAÇÃO VIA FETCH DO JSON EXTERNO
async function inicializarJogo() {
    try {
        const resposta = await fetch('dados.json');
        const dados = await respuesta.json();
        
        // Processa os dados importados do JSON
        dados.times.forEach(clube => {
            bancoDeDadosClubes[clube.nome] = {
                nome: club.nome,
                orcamento: club.orçamento,
                elenco: clube.jogadores,
                pontos: 0, jogos: 0, vitorias: 0, empates: 0, derrotas: 0
            };
            
            // Completa elenco automaticamente caso o JSON tenha poucos jogadores
            completarElencoSuporte(clube.nome);
        });

        popularSelectTimes();
        trocarTimeUsuario(timeAtualUsuario);
        inicializarQuadroTatico();

    } catch (erro) {
        console.error("Erro ao carregar o banco de dados dos jogadores:", erro);
    }
}

function completarElencoSuporte(nomeTime) {
    let elenco = bancoDeDadosClubes[nomeTime].elenco;
    const posicoes = ["DEF", "DEF", "MEI", "MEI", "ATA"];
    let i = 1;
    
    while(elenco.length < 16) {
        let pos = posicoes[Math.floor(Math.random() * posicoes.length)];
        let ovr = Math.floor(Math.random() * 15) + 65;
        elenco.push({
            pos: pos,
            nome: `${pos} Genérico #${i++}`,
            idade: Math.floor(Math.random() * 12) + 18,
            ovr: ovr,
            ata: pos === "ATA" ? ovr + 5 : ovr - 10,
            def: pos === "DEF" ? ovr + 5 : ovr - 10,
            fis: ovr,
            valor: ovr * 500000
        });
    }
}

function carregarElencoNaTela() {
    const tabela = document.getElementById("tabela-jogadores");
    if(!tabela) return;
    tabela.innerHTML = "";
    
    const time = bancoDeDadosClubes[timeAtualUsuario];
    time.elenco.sort((a, b) => b.ovr - a.ovr);

    time.elenco.forEach(j => {
        tabela.innerHTML += `
            <tr>
                <td><span class="badge-pos">${j.pos}</span></td>
                <td><b>${j.nome}</b></td>
                <td>${j.idade} anos</td>
                <td style="color: var(--accent-neon); font-weight: bold;">${j.ovr}</td>
                <td>ATA: ${j.ata} | DEF: ${j.def} | FIS: ${j.fis}</td>
            </tr>
        `;
    });
}

function popularSelectTimes() {
    const select = document.getElementById("select-time-usuario");
    if(!select) return;
    select.innerHTML = "";
    Object.keys(bancoDeDadosClubes).forEach(nome => {
        select.innerHTML += `<option value="${nome}">${nome}</option>`;
    });
}

function trocarTimeUsuario(novoTime) {
    timeAtualUsuario = novoTime;
    document.getElementById("meu-time-nome").innerText = novoTime;
    document.getElementById("financas-txt").innerText = `£ ${bancoDeDadosClubes[novoTime].orcamento.toLocaleString('en-US')}`;
    carregarElencoNaTela();
}

// LÓGICA DO QUADRO TÁTICO
const posicoesIniciais = [
    { pos: "GOL", x: 46, y: 88 }, { pos: "ZAG", x: 25, y: 72 }, { pos: "ZAG", x: 67, y: 72 },
    { pos: "LD",  x: 8,  y: 65 }, { pos: "LE",  x: 84, y: 65 }, { pos: "VOL", x: 35, y: 48 }, 
    { pos: "MEI", x: 58, y: 48 }, { pos: "MD",  x: 12, y: 40 }, { pos: "ME",  x: 80, y: 40 },
    { pos: "ATA", x: 30, y: 15 }, { pos: "ATA", x: 62, y: 15 }
];

function inicializarQuadroTatico() {
    const campo = document.getElementById("campo-futebol");
    if(!campo) return;
    campo.querySelectorAll('.jogador-bola').forEach(b => b.remove());
    
    posicoesIniciais.forEach(p => {
        const bola = document.createElement("div");
        bola.className = "jogador-bola";
        bola.innerText = p.pos;
        bola.style.left = p.x + "%";
        bola.style.top = p.y + "%";
        tornarElementoArrastavel(bola, campo);
        campo.appendChild(bola);
    });
}

function tornarElementoArrastavel(elemento, container) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    elemento.onmousedown = dragMouseDown;
    elemento.ontouchstart = dragMouseDown;

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        pos3 = e.clientX || (e.touches ? e.touches[0].clientX : 0);
        pos4 = e.clientY || (e.touches ? e.touches[0].clientY : 0);
        document.onmouseup = closeDragElement;
        document.ontouchend = closeDragElement;
        document.onmousemove = elementDrag;
        document.ontouchmove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        let clientX = e.clientX || (e.touches ? e.touches[0].clientX : pos3);
        let clientY = e.clientY || (e.touches ? e.touches[0].clientY : pos4);
        pos1 = pos3 - clientX; pos2 = pos4 - clientY;
        pos3 = clientX; pos4 = clientY;

        let novoTop = elemento.offsetTop - pos2;
        let novoLeft = elemento.offsetLeft - pos1;

        if (novoTop >= 0 && novoTop <= (container.clientHeight - elemento.clientHeight)) elemento.style.top = novoTop + "px";
        if (novoLeft >= 0 && novoLeft <= (container.clientWidth - elemento.clientWidth)) elemento.style.left = novoLeft + "px";
    }

    function closeDragElement() {
        document.onmouseup = null; document.onmousemove = null;
        document.ontouchend = null; document.ontouchmove = null;
    }
}

function mudarTela(telaId, botao) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.menu-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`tela-${telaId}`).classList.add('active');
    botao.classList.add('active');
}

// Dispara o boot do jogo ao carregar a página
window.onload = inicializarJogo;
