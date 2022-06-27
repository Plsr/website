---
layout: page
title: reportty
permalink: /projects/reportty
---

[See on Github](https://github.com/Plsr/reportty) \| [Devlog](#devlog)

Reportty is a small pomodoro timer with minimal taks management added to it. I mostly use this project to learn electron.

I would describe the current state as a MVP. It is possible to cycle through timers, getting notified on finish. In the settings, the lenght of all timers can be adapted.

<figure>
  <div class="image-split">
    <img src="https://dlulzqpyd0pcw.cloudfront.net/reportty-main-250622.png" />
    <img src="https://dlulzqpyd0pcw.cloudfront.net/reportty-settings-250622.png" />
  </div>
  <figcaption>reportty main/settings screens as of June 2022</figcaption>
</figure>

The idea is to have a list of tasks in the app as well, so the user can start pomodoros for a task and see how much time they spent on it.

Latest release is available [on github](https://github.com/Plsr/reportty/releases). Arm64 mac only at this time. Sorry.

There are other apps out there that do all these things an better. This is just a learning project.

<h2 id="devlog">Devlog</h2>

#### 27th June 2022
* Implemented a basic reports feature ([commit](https://github.com/Plsr/reportty/commit/1871d0260cd080046de018ade661f7769c368855))
  * Users now can enter a task they are working on 
  * After finishing a work interval, a total number of finished intervals for the day is displayed
  * Finished intervals are grouped by task in a list as well. They display the number of finished intervals and the total time spent, in case the user changes the interval time in between tasks
* Still very rough from a UX and UI perspective, more work to do there. But it works.
* Next will work out a better flow for the tasks feature. Then have to think about how to only display stuff from the current day and where to store past data. After that some housekeeping and porting the React code to Typescript.
