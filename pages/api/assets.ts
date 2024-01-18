import assets from '../../data/assets.json';

export default function handler(req: any, res: any) {
    if (req.method === 'GET') {
        const { type } = req.query;
        const found = assets.filter(asset => asset.type === type)
        if (found.length <= 0) {
            res.status(400).send('Nenhum asset deste tipo foi encontrado');
            return;
        }
        res.status(200).json(found[0].data);
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Método ${req.method} Não Permitido`);
    }
}