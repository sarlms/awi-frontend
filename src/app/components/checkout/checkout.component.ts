//src/app/components/checkout/checkout.component.ts :
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ClientService } from '../../services/client.service';
import { DepositedGameService } from '../../services/depositedGame.service';
import { NavbarComponent } from '../navbar/navbar.component';
import { TransactionService } from '../../services/transaction.service';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule, NavbarComponent],
})
export class CheckoutComponent implements OnInit {
  clients: any[] = [];
  selectedClient: any = null;

  scannedGameId: string = '';
  cartItems: { gameData: any | null }[] = [];
  totalCost: number = 0;
  errorMessage: string = ''; // Message d'erreur pour les ajouts multiples

  constructor(
    private clientService: ClientService,
    private depositedGameService: DepositedGameService,
    private transactionService: TransactionService, // Ajout du service des transactions
  ) {}

  ngOnInit(): void {
    document.body.style.overflow = 'visible';
    this.loadClients();
  }

  // Charger les clients depuis le service
  loadClients(): void {
    this.clientService.getAllClients().subscribe({
      next: (clients) => {
        console.log('Clients chargés :', clients); // Vérifiez si la structure contient des emails
        this.clients = clients;
      },
      error: (err) =>
        console.error('Erreur lors du chargement des clients', err),
    });
  }
  

  // Sélectionner un client
  onClientSelect(event: any): void {
    const clientId = event.target.value;
    this.selectedClient = this.clients.find((client) => client._id === clientId);
  }

  // Ajouter un article scanné
  addScannedGame(): void {
    const gameId = this.scannedGameId.trim();
    if (!gameId) {
      this.errorMessage = 'Veuillez entrer un ID valide.';
      return;
    }

    // Vérifier si l'article est déjà dans le panier
    if (this.cartItems.some((item) => item.gameData?._id === gameId)) {
      this.errorMessage = `L'article avec l'ID ${gameId} est déjà dans le panier.`;
      return;
    }

    this.depositedGameService.getDepositedGameById(gameId).subscribe({
      next: (game) => {
        this.cartItems.push({ gameData: game });
        this.updateTotalCost();
        this.scannedGameId = ''; // Réinitialise la case de scan
        this.errorMessage = ''; // Réinitialise le message d'erreur
      },
      error: (err) => {
        this.errorMessage = `Erreur lors du scan du jeu avec ID: ${gameId}`;
        console.error(err);
      },
    });
  }

  // Supprimer un article du panier
  removeCartItem(index: number): void {
    this.cartItems.splice(index, 1);
    this.updateTotalCost();
  }

  // Mettre à jour le coût total
  updateTotalCost(): void {
    this.totalCost = this.cartItems.reduce((total, item) => {
      return item.gameData ? total + item.gameData.salePrice : total;
    }, 0);
  }

  // Méthode pour finaliser le paiement et créer des transactions
  finalizeCheckout(): void {
    if (!this.selectedClient) {
      alert('Veuillez sélectionner un client avant de finaliser.');
      return;
    }

    const transactions = this.cartItems.map((item) => ({
      labelId: item.gameData._id,
      sessionId: item.gameData.sessionId,
      sellerId: item.gameData.sellerId,
      clientId: this.selectedClient._id,
    }));

    console.log('Transactions à envoyer :', transactions);

    this.transactionService.createMultipleTransactions(transactions).subscribe({
  next: (response: any) => { // Ajoutez un type explicite ici
    alert(`Transaction réussie pour ${response.length} articles. Total : ${this.totalCost} $`);
    this.cartItems = [];
    this.totalCost = 0;
  },
  error: (error: any) => { // Ajoutez également un type ici
    console.error('Erreur lors de la finalisation des transactions', error);
    alert('Une erreur est survenue. Veuillez réessayer.');
  },
});
  }
}
