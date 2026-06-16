from setuptools import setup, find_packages

with open("requirements.txt", "r", encoding="utf-8") as f:
    requirements = f.read().splitlines()

setup(
    name="mapa-bh",
    version="1.0.0",
    description="Mapa BH — ferramenta para gerar GPX de bairros de Belo Horizonte.",
    long_description=open("README.md", "r", encoding="utf-8").read(),
    long_description_content_type="text/markdown",
    author="Marcelo Chaves",
    author_email="marcelochaves17@gmail.com",
    url="https://github.com/marcelochaves95/mapa-bh",
    packages=find_packages(),
    include_package_data=True,
    install_requires=requirements,
    entry_points={
        "console_scripts": [
            "mapa-bh=app.main:main",
        ],
    },
    classifiers=[
        "Programming Language :: Python :: 3",
        "Operating System :: OS Independent",
    ],
    python_requires=">=3.8")
