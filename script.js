// ============ FIREBASE ============== 
  import { initializeApp } from 
  "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";

  import { 
    getFirestore,
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc
   } from 
   "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";
  
  const firebaseConfig = {
    apiKey: "AIzaSyDzJmbzatoZl5Ak-mZ9AMo5G02VKcK_qQE",
    authDomain: "site-de-anuncios-8d660.firebaseapp.com",
    projectId: "site-de-anuncios-8d660",
    storageBucket: "site-de-anuncios-8d660.firebasestorage.app",
    messagingSenderId: "849965720689",
    appId: "1:849965720689:web:611fb8460ba5165e7367d0",
    measurementId: "G-EHMZSPBLQJ"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

// ============ SELEÇÃO DE ELEMENTOS ============ 
const listaAnuncios = [];

const campoBusca = document.getElementById("campo-busca");
const form = document.getElementById("form-anuncio");
const main = document.querySelector("main")

// ============ FUNÇÕES ============ 
function limparNumero(numero) {
    return numero.replace(/\D/g, "");
}

async function salvarAnuncio(nome, descricao, whatsapp, categoria, imagem) {
    await addDoc(collection(db, "anuncios"), {
        nome,
        descricao,
        whatsapp,
        categoria,
        imagem
    });

    alert("Anúncio salvo na nuvem");

    carregarAnunciosFirebase(); //atualiza a lista
}

/*function carregarAnuncios() {
    const dados = localStorage.getItem("anuncios");

    if (dados) {
        const listaSalva = JSON.parse(dados);

        listaAnuncios.length = 0;
        listaAnuncios.push(...listaSalva);

        renderizarAnuncios(listaAnuncios);
    }
}*/

async function carregarAnunciosFirebase() {
    main.innerHTML = "<p>Carregando anúncios</p>"

    const querySnapshot = await getDocs(collection(db, "anuncios"));

    listaAnuncios.length = 0;

    querySnapshot.forEach((doc) => {
        listaAnuncios.push({
            id: doc.id,
            ...doc.data()
        });
    });

    renderizarAnuncios(listaAnuncios);
}

function filtrarAnuncios(textoBusca) {
    return listaAnuncios.filter((anuncio) => {
        return (
            anuncio.nome.toLowerCase().includes(textoBusca.toLowerCase()) ||

            anuncio.descricao.toLowerCase().includes(textoBusca.toLowerCase()) || 
            anuncio.categoria.toLowerCase().includes(textoBusca.toLowerCase())
        );
    });
}

function filtrarCategoria(categoria, botao) {
    
    const botoes = document.querySelectorAll(".btn-filtro");

    botoes.forEach(b => b.classList.remove("ativo"));
    botao.classList.add("ativo");

    if (categoria === "Todos") {
        renderizarAnuncios(listaAnuncios);
        return;
    }

    const filtrados = listaAnuncios.filter((anuncio) => {
        return anuncio.categoria === categoria;
    })

    renderizarAnuncios(filtrados);
}

function renderizarAnuncios(lista) {
    main.innerHTML = "";

if (lista.length === 0) {
        main.innerHTML = '<p style="text-align: center; color: #999;">Nenhum anúncio cadastrado.</p>';
        return;
    }
    lista.forEach((anuncio) => {
        const div = document.createElement("div");
        div.classList.add("anuncio");

        div.innerHTML = `
            ${anuncio.imagem ? `<img src="${anuncio.imagem}" class="imagem-anuncio">` : ""}

            <h2>${anuncio.nome}</h2>
            <p>${anuncio.descricao}</p>
            <p class="categoria"><strong>Categoria:</strong>${anuncio.categoria}</p>

            <!-- <a class="whatsapp" 
            href="https://wa.me/55${anuncio.whatsapp}?text=Olá,%20vi%20seu%20anúncio%20no%20site%20de%20Serviços%20Locais!" target="_blank">
                Falar no WhatsApp
            </a>-->

            <div class="acoes">
                <a href="
                 https://wa.me/55${anuncio.whatsapp}" target="_blank" class="whatsapp">
                    Whatsapp
                </a>

                <button class="excluir" data-id="${anuncio.id}">
                    Excluir
                </button>
            </div>
        `;

        main.appendChild(div);
    });
}

function salvarAnuncioComImagem(nome, descricao, whatsapp, categoria, imagem) {
   

    const novoAnuncio = {
        id: Date.now(),
        nome: nome,
        descricao: descricao,
        whatsapp: whatsapp,
        categoria: categoria,
        imagem: imagem
    };

    renderizarAnuncios(listaAnuncios);

    form.reset();

    alert("Anúncio cadastrado com imagem");
}

// ============ EVENTOS ============
form.addEventListener("submit", function(event) {
    event.preventDefault();

    const nome = document.getElementById("nome").value;
    const descricao = document.getElementById("descricao").value;
    const whatsapp = limparNumero(document.getElementById("whatsapp").value);
    const categoria = document.getElementById("categoria").value;

    const imagemInput = document.getElementById("imagem");
    let arquivo = imagemInput.files[0];

    if (!nome || !descricao || !whatsapp || !categoria) {
        alert("Preencha todos os campos.");
        return;
    }

    if (arquivo) {
        const reader = new FileReader();

        reader.onload = function(e) {
            salvarAnuncio(nome, descricao, whatsapp, categoria, e.target.result);
        };

        reader.readAsDataURL(arquivo);
    } else {
        salvarAnuncio(nome, descricao, whatsapp, categoria, "");
    }
});


campoBusca.addEventListener("input", () => {
    const texto = campoBusca.value.trim();

    if (texto.length < 3) {
        renderizarAnuncios(listaAnuncios);
        return;
    }

    const resultado = filtrarAnuncios(texto);

    renderizarAnuncios(resultado);
});

document.querySelectorAll(".filtros button").forEach(botao => {
    botao.addEventListener("click", () => {
        const categoria = botao.textContent;
        filtrarCategoria(categoria, botao);
    });
});

main.addEventListener("click", async (event) => {

    const botaoExcluir = event.target.closest(".excluir");

    if (!botaoExcluir) return;

    const confirmar = confirm("Tem certeza que desejz excluir este anúncio?");
    if (!confirmar) return;

    const id = botaoExcluir.getAttribute("data-id");

    await deleteDoc(doc(db, "anuncios", id));

    carregarAnunciosFirebase();

    /*const novaLista = listaAnuncios.filter((anuncio) => {
        return anuncio.id !== id;*/
    

    listaAnuncios.length = 0;

    renderizarAnuncios(listaAnuncios);
});

const botaoLimpar = document.getElementById("limpar-tudo");

    botaoLimpar.addEventListener("click", () => {
        const confirmar = confirm("Deseja apagar todos os anúncios?");

        if (!confirmar) return;

        listaAnuncios.length = 0;

        renderizarAnuncios(listaAnuncios);
    })
carregarAnunciosFirebase();
