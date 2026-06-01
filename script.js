// ============ FIREBASE ============== 

  import { initializeApp } from 
  "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";

  import { 
    getFirestore,
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    updateDoc
   } from 
   "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

   import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
   } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js"
  
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
  const auth = getAuth(app);

// ============ SELEÇÃO DE ELEMENTOS ============ 
const listaAnuncios = [];

const btnCadastro = document.getElementById("btn-cadastro");
const btnLogin = document.getElementById("btn-login");
const btnLogout = document.getElementById("btn-logout");

const inputEmail = document.getElementById("email");
const inputSenha = document.getElementById("senha");

const usuarioLogadoTexto = document.getElementById("usuario-logado");

const btnMeus = document.getElementById("btn-meus");
const btnTodos = document.getElementById("btn-todos");

const campoBusca = document.getElementById("campo-busca");
const form = document.getElementById("form-anuncio");
const main = document.querySelector("main")
let idEditando = null;

// ============ FUNÇÕES ============ 
function limparNumero(numero) {
    return numero.replace(/\D/g, "");
}

async function salvarAnuncio(nome, descricao, whatsapp, categoria, imagem) {
    const user = auth.currentUser;

    try {

        if ( idEditando) {
            const referencia = doc(db, "anuncios", idEditando);

            await updateDoc(referencia, {
                nome,
                descricao,
                whatsapp,
                categoria,
                imagem
            });

            idEditando = null;

            alert("Anúncio atualizado!");
        } else {

        
            await addDoc(collection(db, "anuncios"), {
                nome,
                descricao,
                whatsapp,
                categoria,
                imagem,
                usuario: user ? user.email : "anonimo"
            });
            alert("Anúncio salvo na nuvem");
        }

        carregarAnunciosFirebase(); //atualiza a lista
        form.reset();

    } catch (erro) {
    console.error(erro);
    alert("Erro ao salvar");
    }
}

async function carregarAnunciosFirebase() {
    try {
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
    } catch (erro) {
        console.error("Erro ao carregar:");
        main.innerHTML = "<p>Erro ao carregar anúncios.</p>";
    }
}

function filtrarMeusAnuncios() {
    const user = auth.currentUser;

    if (!user) {
        alert("Faça login primeiro");
        return;
    }

    const meus = listaAnuncios.filter((anuncio) => {
        return anuncio.usuario === user.email;
    });

    renderizarAnuncios(meus);
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

            <p><strong>Criado por:</strong> ${anuncio.usuario}</p>

            <!-- <a class="whatsapp" 
            href="https://wa.me/55${anuncio.whatsapp}?text=Olá,%20vi%20seu%20anúncio%20no%20site%20de%20Serviços%20Locais!" target="_blank">
                Falar no WhatsApp
            </a>-->

            <div class="acoes">
                <a href="https://wa.me/55${anuncio.whatsapp}" target="_blank" class="whatsapp">
                    Whatsapp
                </a>

                <button class="editar" data-id="${anuncio.id}">Editar</button>

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

btnMeus.addEventListener("click", () => {
    filtrarMeusAnuncios();
});

btnTodos.addEventListener("click", () => {
    renderizarAnuncios(listaAnuncios);
})

btnCadastro.addEventListener("click", async () => {
    const email = inputEmail.value;
    const senha = inputSenha.value;

    try {
        await createUserWithEmailAndPassword(auth, email, senha);
        alert("Usuário criado!");
    } catch (erro) {
        console.error(erro);
        alert("Erro ao cadastrar" + erro.message);
    }
});

btnLogin.addEventListener("click", async () => {
    const email = inputEmail.value;
    const senha = inputSenha.value;

    try {
        await signInWithEmailAndPassword(auth, email, senha);
        alert("Login realizado!");
    } catch (erro) {
        console.error(erro);
        alert("Erro ao logar");
    }
});

btnLogout.addEventListener("click", async () => {
    await signOut(auth);
    alert("Saiu da conta");
})


campoBusca.addEventListener("input", () => {
    const texto = campoBusca.value.trim();

    if (texto.length < 3) {
        renderizarAnuncios(listaAnuncios);
        return;
    }

    const resultado = filtrarAnuncios(texto);

    renderizarAnuncios(resultado);
});

main.addEventListener("click", async (event) => {

    const botaoEditar = event.target.closest(".editar");
    const botaoExcluir = event.target.closest(".excluir");

    if (botaoEditar) {
        const id = botaoEditar.getAttribute("data-id");

        const anuncio = listaAnuncios.find(a => a.id === id);

        const user = auth.currentUser;

        if (!user || anuncio.usuario !== user.email) {
            alert("Você não pode editar este anúncio");
            return;
        }

        // Preencher formulário
        document.getElementById("nome").value = anuncio.nome;
        document.getElementById("descricao").value = anuncio.descricao;
        document.getElementById("whatsapp").value = anuncio.whatsapp;
        document.getElementById("categoria").value = anuncio.categoria;

        idEditando = id;

        return;
    }

    if (!botaoExcluir) return;

    const confirmar = confirm("Tem certeza que desejz excluir este anúncio?");
    if (!confirmar) return;

    const id = botaoExcluir.getAttribute("data-id");

    const anuncio = listaAnuncios.find(a => a.id === id);

    const user = auth.currentUser;
    if (anuncio.usuario && anuncio.usuario !== user.email) {
        alert("Você não pode excluir este anúncio");
        return;
    }

    try {
        
        await deleteDoc(doc(db, "anuncios", id));
        carregarAnunciosFirebase();
    } catch (erro) {
    console.error("Erro ao excluir:", erro);
    alert("Erro ao excluir anúncio");
    }

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

    onAuthStateChanged(auth, (user) => {
        if (user) {
            usuarioLogadoTexto.innerHTML = "Logado como: " + user.email;

            btnLogin.style.display = "none";
            btnCadastro.style.display = "none";
            btnLogout.style.display = "inline-block";

            form.style.display = "block";
        } else {
            usuarioLogadoTexto.innerHTML = "Nenhum usuário logado";

            btnLogin.style.display = "inline-block";
            btnCadastro.style.display = "inline-block";
            btnLogout.style.display = "none";

            form.style.display = "none";
        }
    });
carregarAnunciosFirebase();
