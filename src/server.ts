import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// Estado inicial
// Estado inicial com uma conta de exemplo
let accounts: { [key: string]: number } = {
  '100': 0 // ID da conta com saldo inicial de 0
};

// Rota para redefinir o estado
app.post('/reset', (req: Request, res: Response) => {
    accounts = {};
    res.status(200).send('State reset successfully.');
});

// Rota para obter saldo
app.get('/balance', (req: Request, res: Response) => {
    const accountId = req.query.account_id as string;
    const balance = accounts[accountId];
    if (balance === undefined) {
        res.status(404).send('Account not found.');
    } else {
        res.status(200).json({ balance });
    }
});

// Rota para depositar
app.post('/event', (req: Request, res: Response) => {
    const { type, destination, amount, origin } = req.body;
    if (type === 'deposit') {
        accounts[destination] = (accounts[destination] || 0) + amount;
        res.status(201).json({ destination: { id: destination, balance: accounts[destination] } });
    } else if (type === 'withdraw') {
        if (accounts[origin] === undefined || accounts[origin] < amount) {
            res.status(404).send('Insufficient funds.');
        } else {
            accounts[origin] -= amount;
            res.status(201).json({ origin: { id: origin, balance: accounts[origin] } });
        }
    } else if (type === 'transfer') {
        if (accounts[origin] === undefined || accounts[origin] < amount) {
            res.status(404).send('Insufficient funds.');
        } else {
            accounts[origin] -= amount;
            accounts[destination] = (accounts[destination] || 0) + amount;
            res.status(201).json({
                origin: { id: origin, balance: accounts[origin] },
                destination: { id: destination, balance: accounts[destination] }
            });
        }
    } else {
        res.status(400).send('Invalid event type.');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
