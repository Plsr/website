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

#### 5th July 2022

- Found a solution for the unreliable timers. First iteration was to store the timer end time as a `Date`, then listen for
  regain of focus in the main process and recalculate the time left. This worked, but was a lot more complicated then I
  initially thought. While this was fixing the timer issue, other time sensitive parts, most importantly the notifications
  where only working once the window regained focus.
- Final solution was to set `backgroundThrottling` for the browser window. This fixes all the problems I had. Want to
  look into setting this dynamically only when a timer is running, as I want the app to be throttled in background otherwise,
  even if it's not doing much.

#### 2nd July 2022

- Converted all the renderer files to TypeScript. Was a little bumpy getting the JSON Schema for the store in line with types, but found an okay solution.
- Discovered a but where the timer would update way to infequently when the app is in background so that timers almost took twice as long as they should. Laid some groundwork to fixing this. Will probably write in more detail once the fix is complete.

#### 30th June 2022

- Did some rough updates on the UI. There is no concept behind it at this point, but things that belong together are grouped together. Not great, not terrible ([commit](https://github.com/Plsr/reportty/commit/d058e93131ce7a0f98ef0e9e9e77272869a4cb88))
- Had some struggle with the autoupdater still pointing to the boilerplate repo. Did not figure that out this evening and just disabled auto-updates for now. Topic for later.
- Also struggled with an issue for 30 minutes that TypeScript marked right away after transforming the file. Need to convert all files to TypeScript asap.

#### 27th June 2022

- Implemented a basic reports feature ([commit](https://github.com/Plsr/reportty/commit/1871d0260cd080046de018ade661f7769c368855))
  - Users now can enter a task they are working on
  - After finishing a work interval, a total number of finished intervals for the day is displayed
  - Finished intervals are grouped by task in a list as well. They display the number of finished intervals and the total time spent, in case the user changes the interval time in between tasks
- Still very rough from a UX and UI perspective, more work to do there. But it works.
- Next will work out a better flow for the tasks feature. Then have to think about how to only display stuff from the current day and where to store past data. After that some housekeeping and porting the React code to Typescript.
