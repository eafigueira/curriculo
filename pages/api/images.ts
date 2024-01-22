import { readFile } from 'fs';
import path from "path";

export default function handler(req: any, res: any) {
    if (req.method === 'GET') {
        const { type } = req.query;

        if (!type) {
            res.status(400).send('Nome da imagem é necessário');
            return;
        }

        try {
            const imagePath = path.join(process.cwd(), 'data/images', `${type.toLowerCase()}.png`);
            readFile(imagePath, (err, data) => {
                if (err) {
                    if (err.code === 'ENOENT') {
                        res.status(404).send('Imagem não encontrada');
                    } else {
                        res.status(500).send('Erro ao ler a imagem');
                    }
                } else {
                    res.setHeader('Content-Type', 'image/png');
                    res.status(200).send(data);
                }
            });
        } catch (error) {
            res.status(500).send('Erro no servidor');
        }

    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Método ${req.method} Não Permitido`);
    }
}