# game
## lovefish
[demo](https://happymia.github.io/game/lovefish/index.html)
## 简介
* 用鼠标控制鱼妈妈吃海葵喂鱼宝宝
* 在鱼宝宝身体变百之前喂食鱼宝宝，否则游戏结束
* 尽量保证鱼妈妈每次都能吃到一颗蓝色海葵来得到更高的分数！
* 可以在游戏过程中随时点击游戏界面来暂停/开始/或者重新游戏！
* 游戏过程中会伴随背景音乐，使游戏活灵活现。
* 游戏结束会保存每次的最高成绩！

## 总结
  基于原生JavaScript和HTML5的一个游戏开发，利用了HTML5中的canvas绘图API，audio音频API，localStorage API，requestAnimationFrame以及JavaScript API和事件模型等，通过循环进行一帧帧的画面绘制，呈现一个流畅的动态效果。<br>
  ### 本游戏主要让我练习了HTML5新型API使用，但也遇到了一些问题。<br>
   1.一轮游戏结束，另一轮开始，动画暂停不了。解决：利用cancelAnimationFrame() API删除前面的动画帧。<br>
   2. 果实的大小和两帧之间的时间差成正比，如果时间差很大，则果实会异常大。解决：为时间差限制一个上限。
