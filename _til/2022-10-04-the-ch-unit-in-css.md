---
layout: til
title: The ch unit in CSS
date: 2022-10-04T20:32:07.562Z
---
Stumbled across the `ch` unit in a Code Review today. Since I never saw it before, I think it is a good idea to write it down here.

The `ch` unit refers to the width of the “0” (zero) character of the font that is used for the element.  
For monospace fonts, this obviously is true for all characters, so giving an element  a `width` of `30ch` will make exactly 30 characters fit into it. This is not true for variable-width fonts. [meyerweb](https://meyerweb.com/eric/thoughts/2018/06/28/what-is-the-css-ch-unit/) recommends a width that is 20-30% narrower than the desired character count (so `60ch` if you want 80 characters).