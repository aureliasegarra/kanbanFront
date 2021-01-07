// on objet qui contient des fonctions
var app = {
    base_url: 'http://localhost:5050',
    // fonction d'initialisation, lancée au chargement de la page
    init: function () {
      console.log('app.init !');
      app.getListsFromApi();
      app.addListenerToActions();
    },
  // Méthodes qui interagissent avec le DOM
    addListenerToActions: () => {
      // Listen to new list button
      const addListButton = document.getElementById('addListButton');
      addListButton.addEventListener('click', app.showAddListModal);
      // Listen to close modal buttons
      const closeButtons = document.querySelectorAll('.close');
      // J'ai un tableau d'éléments du DOM (NodeList)
      closeButtons.forEach((closeButton) => {
        closeButton.addEventListener('click', app.hideModals);
      });
      const addListForm = document.querySelector('#addListModal form');
      addListForm.addEventListener('submit', app.handleAddListForm);
      // boutons "ajouter une carte"
      let addCardButtons = document.querySelectorAll('.button--add-card');
      for (let button of addCardButtons) {
        button.addEventListener('click', app.showAddCardModal);
      }
      // formulaire "ajouter une carte"
      let addCardForm = document.querySelector('#addCardModal form');
      addCardForm.addEventListener('submit', app.handleAddCardForm);
  
      //cibler les boutons "poubelle" pour supprimer une carte
      const deleteButtons = document.querySelectorAll('.has-text-danger');
      for (let button of deleteButtons){
        button.addEventListener('click', app.removeCard);
      }
    },
  
    showAddListModal: (evt) => {
      const modal = document.getElementById('addListModal');
      modal.classList.add('is-active');
    },
  
    showAddCardModal: (event) => {
      // event.target contient la cible du click
      let listElement = event.target.closest('.panel');
      // on récupère l'id de la liste cible
      const listId = listElement.getAttribute('list-id');
  
      let modal = document.getElementById('addCardModal');
      // on récupère l'input
      let input = modal.querySelector('input[name="list_id"]');
      // on change sa valeur
      input.value = listId;
      // on a plus qu'à afficher la modale
      modal.classList.add('is-active');
    },
  
    hideModals: () => {
      const modals = document.querySelectorAll('.modal');
      modals.forEach((modal) => {
        modal.classList.remove('is-active');
      });
    },
  
    handleAddListForm: async (evt) => {
      // evt.target contient l'élément Form du DOM
      // J'empêche le rechargement de la page
      evt.preventDefault();
      // Ici l'élément du DOM ayant appelé ma fonction
      // est un <Form>
      console.log(evt.target);
      console.log("Submit d'une nouvelle liste");
      // Je veux récupérer les données du formulaires
      const data = new FormData(evt.target);
      // J'utilise data pour obtenir (get) la valeur d'un
      // input ayant
      // Avant de fabriquer une liste dans le DOM
      // Je dois la sauver graĉe à l'API. L'API
      // une fois la liste enregistrée me donnera
      // son id
      try {
        const res = await fetch(app.base_url + '/lists', {
          method: 'post',
          body: data,
        });
        if (!res.ok) {
          const error = await res.json();
          console.trace(error);
        } else {
          const list = await res.json();
          app.makeListInDom(list.name, list.id);
        }
      } catch (error) {
        console.trace(error);
      }
  
      // app.makeListInDom(data.get('name'));
      app.hideModals();
    },
  
    handleAddCardForm: async (event) => {
      // on empeche le rechargement de la page
      event.preventDefault();
      // on récupère les infos dur form
      let data = new FormData(event.target);
      // Je vais enrgistrer ma carte via l'API
      try {
        const response = await fetch(app.base_url + '/cards', {
          method: 'POST',
          body: data,
        });
        if (!response.ok) {
          const error = await response.json();
          console.trace(error);
        } else {
          const card = await response.json();
          // et on les passe à la bonne méthode
          app.makeCardInDOM(card.content, card.list_id, card.id, card.color);
        }
      } catch (error) {
        alert('Impossible de créer une carte');
        console.error(error);
      }
  
      // et on ferme les modales !
      app.hideModals();
    },
  
    makeListInDom: (name, id) => {
      // Je récupère le template
      const template = document.getElementById('template-list');
      // J'en fais une copie
      const newList = document.importNode(template.content, true);
      // Je peux changer les infos dans la copie
      newList.querySelector('h2').textContent = name;
      // J'écoute le click sur le bouton
      newList
        .querySelector('.button--add-card')
        .addEventListener('click', app.showAddCardModal);
      // J'ajoute l'id en attibut list-id
      newList.querySelector('.panel').setAttribute('list-id', id);
      // J'ajoute ma liste dans la zone des listes
      template.before(newList);
    },
  
    makeCardInDOM: (cardContent, listId, cardId, cardColor) => {
      // récupérer le template
      let template = document.getElementById('template-card');
      // créer une nouvelle copie
      let newCard = document.importNode(template.content, true);
      // changer les valeurs qui vont bien
      newCard.querySelector('.card-name').textContent = cardContent;
      // Je sauve dans le DOM les datas de la card
      const box = newCard.querySelector('.box');
      box.setAttribute('card-id', cardId);
      box.setAttribute('style', 'background-color: ' + cardColor);
  
      // insérer la nouvelle carte dans la bonne liste
      let theGoodList = document.querySelector(`[list-id="${listId}"]`);
      theGoodList.querySelector('.panel-block').appendChild(newCard);
    },
  
    removeCard: (event) => {
      let card = event.target.closest('.box');
      card.remove();
    },
  
  // Methode qui interagit avec l'API 
    getListsFromApi: async () => {
      // Je cherche à récupérer les listes
      const fetchURL = app.base_url + '/lists';
      try {
        const res = await fetch(fetchURL);
        const lists = await res.json();
        console.log(lists);
        // Je veux maintenant afficher ces listes dans le DOM
        lists.forEach((list) => {
          // Pour chaque liste dans mon tableau de listes
          app.makeListInDom(list.name, list.id);
          list.cards.forEach((card) => {
            app.makeCardInDOM(card.content, list.id, card.id, card.color);
          });
        });
      } catch (e) {
        console.trace(e);
      }
    },
  
    deleteCardInDom: async () => {
      // Je cherche à effacer une carte via l'API
      try {
        const response = await fetch(app.base_url + '/cards', {
          method: 'DELETE',
          body: data
        });
        if(!response.ok){
          const error = await response.json();
          console.trace(error);
        } else {
          const card = await response.json();
          // on transmet à la méthode qui convient
          app.deleteCardInDom(card.content, card.list_id, card.id, card.color);
        }
      } catch (error) {
          alert('Impossible d\'effacer une carte');  
          console.error(error);  
      }   
    }
  };
  
  // on accroche un écouteur d'évènement sur le document : quand le chargement est terminé, on lance app.init
  document.addEventListener('DOMContentLoaded', app.init);