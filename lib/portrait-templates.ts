export type PortraitGenerationMode = "trial" | "set";

export type PortraitTemplate = {
  key: string;
  name: string;
  description: string;
  trialCredits: number;
  setCredits: number;
  trialRequest: {
    prompt: string;
    negativePrompt: string;
    maxImages: 1;
  };
  setRequest: {
    prompt: string;
    negativePrompt: string;
    maxImages: number;
  };
};

const nightLanternBasePrompt =
  "严格保留输入照片中人物的真实身份、五官比例、脸型、肤色、眼睛颜色、气质和表情特征，不要换脸，不要改变人种，不要变成另一个人。只改变服装、发型、场景、灯光、姿态和古风写真风格。\n\n整体风格为“夜灯红黑汉服”：红黑金配色，现代唐风汉服灵感，红黑撞色齐胸襦裙，黑色透明轻纱外衫，红色、暗金、红棕渐变的层叠裙摆，红金相间的华丽步摇、珠钗、珍珠流苏发饰，中式红墙巷弄，飞檐翘角木质古建筑，红色灯笼，深蓝暮色天空，暖色逆光，强烈发丝轮廓光，浅景深，真实夜景人像摄影，复古电影胶片质感，神秘、冷艳、华丽、高级商业古风写真。人物是画面唯一主体，脸部清晰自然不过曝，保留真实皮肤纹理，妆容精致自然，红唇不过重。背景建筑、灯笼、灯串只作为氛围，柔和虚化，不要抢主体。黑色轻纱、宽袖、发丝、流苏和裙摆由夜风自然吹动，形成轻盈飘逸的弧线，不要用手抓裙子，不要提裙摆。画面要像真实相机拍摄的高级古风写真，不要插画感，不要塑料皮肤，不要过度AI滤镜。";

const shot01Prompt =
  "近景半身，人物微微侧身回眸，脸部靠近画面上三分之一，人物占画面约 70%。单手持红黑金鬼面面具，面具靠近脸侧，与人物脸部保持接近同一水平线，形成“真实面容与妖异面具互相衬托”的关系。面具不能遮住人物眼睛和主要五官，人物眼神清冷直视镜头。只允许一只手清晰持面具，手腕自然朝内，手指轻握面具边缘，手臂连接合理，另一只手隐藏在宽袖或黑纱中。";

const shot02Prompt =
  "侧背回眸大飘纱。人物从侧后方转身看向镜头，肩背线条优雅，黑色透明轻纱和红黑裙摆被夜风向画面一侧吹起，形成大面积流动弧线，人物占画面约 65% 到 70%。面具作为腰侧或身侧的低调装饰，可以部分露出，但不要让手举面具，不要复杂手势。重点是侧背、回眸、发丝轮廓光、飘动轻纱和红墙灯笼氛围。";

const shot03Prompt =
  "近景黑纱冷艳凝视，不出现面具，不出现扇子，不出现其他手持道具。人物近景半身，人物占画面约 70%，脸部清晰居中偏上，身体轻微侧转，眼睛看向镜头，神情冷艳、安静、有压迫感。黑色轻纱从画面边缘和肩部自然飘过，形成朦胧前景和流动层次，但不能遮住眼睛和主要五官。双手不做复杂动作，可以隐藏在宽袖和轻纱中，不要清晰展示手指。";

const shot04Prompt =
  "团扇半遮面。人物近景半身，身体微微侧身，眼睛直视镜头，气质神秘冷艳。单手持一把小型黑红金圆形团扇，扇面为黑色丝绸、暗金刺绣、红色细边，团扇靠近脸部，只遮住嘴唇到下巴附近的一小部分，不能遮住眼睛、鼻梁、脸型轮廓和主要五官。团扇不要太大，不要放在胸口正中，要贴近脸侧形成含蓄神秘的半遮面效果。只允许一只手清晰持扇，手腕自然，手指轻握扇柄，另一只手隐藏在宽袖和黑纱中。";

const nightLanternNegativePrompt =
  "低质量，模糊，噪点，像素化，过度锐化，AI感，塑料皮肤，蜡像皮肤，过度磨皮，插画感，动漫脸，卡通脸，换脸，不像本人，人种改变，五官错位，脸部变形，眼睛变形，表情僵硬，假笑，现代衣服，西式礼服，和服，浴衣，错误汉服，服装凌乱，颜色跑偏，背景过乱，灯笼压住人物，建筑抢主体，过曝，欠曝，脸部阴影太重，文字，水印，logo，签名，数字，多只手，缺手，断手，坏手，坏手指，多手指，少手指，融合手指，手腕扭曲，手肘断裂，手臂不连接，手臂穿模，人体结构错误，手抓裙子，提裙摆，裙子穿模，轻纱遮住眼睛，面具遮住整张脸，面具挡住眼睛，面具成为主体，面具位置过高，面具压住脸，圆扇太大，扇子遮住眼睛，扇子遮住鼻梁，扇子遮住整张脸，扇子变形，多把扇子";

export const portraitTemplates = {
  nightLanternRedBlackHanfu: {
    key: "nightLanternRedBlackHanfu",
    name: "夜灯红黑汉服",
    description: "红墙巷弄，暮色灯笼，红黑金汉服，4张套图",
    trialCredits: 1,
    setCredits: 4,
    trialRequest: {
      prompt: `${nightLanternBasePrompt}\n\n${shot01Prompt}`,
      negativePrompt: nightLanternNegativePrompt,
      maxImages: 1,
    },
    setRequest: {
      prompt: `生成一套 4 张相关联的竖版 3:4 夜景古风汉服写真。四张图必须是同一个人。\n\n【套图共用基底】${nightLanternBasePrompt}\n\n【第 1 张】${shot01Prompt}\n\n【第 2 张】${shot02Prompt}\n\n【第 3 张】${shot03Prompt}\n\n【第 4 张】${shot04Prompt}\n\n四张图必须保持同一套服装体系、同一发饰体系、同一夜景红墙灯笼场景体系、同一真实摄影质感。四张图只变化姿态、构图、手持道具和局部动作，不要改变人物身份，不要改变整体风格。`,
      negativePrompt: nightLanternNegativePrompt,
      maxImages: 4,
    },
  },
} as const satisfies Record<string, PortraitTemplate>;

export type PortraitTemplateKey = keyof typeof portraitTemplates;

export function isPortraitTemplateKey(value: FormDataEntryValue | null): value is PortraitTemplateKey {
  return typeof value === "string" && value in portraitTemplates;
}

export function isPortraitGenerationMode(value: FormDataEntryValue | null): value is PortraitGenerationMode {
  return value === "trial" || value === "set";
}
