# Icones embutidos sem Angular Material obrigatorio

O pacote nao tera Angular Material como dependencia publica apenas para renderizar icones da barra de ferramentas. Os poucos icones necessarios serao incorporados ao pacote, mantendo a experiencia visual proxima do componente original sem obrigar consumidores a instalar ou configurar `@angular/material/icon`.

## Considered Options

- Manter `@angular/material/icon` como peer dependency.
- Incorporar os icones necessarios no pacote.

## Consequences

O pacote fica mais simples para consumidores, mas a extracao inicial precisa substituir os usos de `<mat-icon>` por uma implementacao interna baseada nos icones incorporados.
