export type Course={
    courseId:string;
    courseName:string;
    type:string;
    createdAt:string;
    id:number,
    courseLayout:courseLayout;
    chapterContentSlide:ChapterContentSlide[];
}

export type courseLayout={
    courseName:string,
    courseDescription:string,
    courseId:string,
    level:string,
    totalChapters:number,
    chapters:Chapter[]
}

export type Chapter={
    chapterId:string,
    chapterTitle:string,
    subContent:string[]
}

export type ChapterContentSlide={
    id:number,
    courseId:string,
    chapterId:string,
    slideId:string,
    slideIndex:number,
    audioFileName:string,
    narration:{
        fullText:string;
    },
    html:string,
    revelData:string[]
    audioFileUrl: string;
    caption: string;                          // may be {chunks:string[]}
}