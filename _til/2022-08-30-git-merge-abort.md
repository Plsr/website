---
layout: til
title: "Abort merge in git"
date: 2022-08-30 21:45 +0200
---

Assume you are in the middle of resolving a complicated merge conflict. Suddenly, your application monitoring
tells you production has a nasty bug which is breaking payment.  
Eager to fix it as soon as possible, you abandon the conflict and try to checkout to another branch.
You are then met with the message **"error: you need to resolve your current index first"**.

An easy way to get out of that is to use `git merge --abort`.  
This will return you to the state before the
merge was started. This also means that all progress you did so far on resolving the conflict is lost, so
keep that in mind.
