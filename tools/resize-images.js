const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const directoryPath = path.join(process.cwd(), 'data', 'images');

fs.readdir(directoryPath, (err, files) => {
    if (err) {
        console.error('Erro ao acessar o diretório de imagens', err);
        return;
    }

    files.forEach(file => {
        const filePath = path.join(directoryPath, file);
        sharp(filePath)
            .metadata()
            .then(metadata => {
                if (metadata.width !== 24 || metadata.height !== 24) {
                    sharp(filePath)
                        .resize(24, 24)
                        .toFile(path.join(directoryPath, '24x24_' + file))
                        .then(() => console.log(`Imagem ${file} redimensionada com sucesso.`))
                        .catch(err => console.error(`Erro ao redimensionar a imagem ${file}:`, err));
                } else {
                    console.log(`A imagem ${file} já está no tamanho 24x24.`);
                }
            })
            .catch(err => console.error(`Erro ao processar a imagem ${file}:`, err));
    });
});
