# Mapa BH
Ferramenta para gerar GPX de bairros de Belo Horizonte.

![](assets/bairros.png)

## Versão web (recomendada)
App estático (web/mobile) hospedado no GitHub Pages — sem instalação:

**https://marcelochaves95.github.io/mapa-bh**

Escolha um bairro, visualize o limite no mapa e baixe o `.gpx` direto no navegador.
Os dados ficam pré-processados em `docs/data/bairros.json` (limites convertidos de
UTM para lat/lon), então o site não depende da API da PBH em tempo de execução.

### Atualizar os dados
Os limites mudam raramente. Para regerar o JSON a partir da PBH:
```
pip install -r requirements.txt
python scripts/generate_data.py
```

### Publicar no GitHub Pages
Em **Settings → Pages**, defina a fonte como branch `main` e pasta `/docs`.

## Versão desktop (Python/PyQt6)

### Instalação
1. Clone o repositório:
```
git clone https://github.com/marcelochaves95/mapa-bh.git
cd mapa-bh
```
2. Instale as dependências necessárias:
```
pip install -r requirements.txt
```

## Uso
1. Execute o script principal:
```
python main.py
```

2. Siga os passos na interface:
- Carregue a lista de bairros.
- Selecione um bairro.
- Gere e salve o arquivo GPX correspondente.

## Requisitos
- Python 3.9 ou superior.
- Dependências listadas em `requirements.txt`.
