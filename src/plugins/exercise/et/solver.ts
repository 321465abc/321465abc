function ready_in(element: HTMLElement) {
    $(element)
        .trigger("click")
        .trigger("focus")
        .trigger("keydown")
        .trigger("input");
}

function event_trigger(element: HTMLElement) {
    $(element)
        .trigger("keyup")
        .trigger("change")
        .trigger("blur");
    try {
        angular.element(element).triggerHandler("hover");
        angular.element(element).triggerHandler("keyup");
        angular.element(element).triggerHandler("blur");
    } catch (error) {}
}

import { store } from "@src/store";
import { sleep } from "@src/utils/common";

export async function solveEt(answers: any[]) {
    const tofOnPaper = document.querySelectorAll("et-tof span.controls span") as NodeListOf<
        HTMLSpanElement
    >;
    let tofOrder = 0;

    const blankOnPaper = document.querySelectorAll("et-blank span.blank") as NodeListOf<
        HTMLSpanElement
    >;
    const textareaOnPaper = document.querySelectorAll("et-blank textarea.blank") as NodeListOf<
        HTMLTextAreaElement
    >;
    let blankOrder = 0;
    let textareaOrder = 0;

    const selectOnPaper = document.querySelectorAll("et-select div") as NodeListOf<HTMLDivElement>;
    let selectOrder = 0;

    const optionOnPaper = document.querySelectorAll("et-choice li") as NodeListOf<HTMLLIElement>;
    const optionSpanOnPaper = document.querySelectorAll("et-choice span") as NodeListOf<
        HTMLSpanElement
    >;
    let liOrder = 0;
    let spanOrder = 0;
    let optionOrder = 0;

    for (const answer of answers) {
        await sleep(store.USER_SETTINGS.solveInterval);

        switch (answer.type) {
            case "et-tof":
                let tofOption: number | undefined = undefined;
                switch (answer.text) {
                    case "t":
                    case "T":
                        tofOption = 2 * tofOrder;
                        break;
                    case "f":
                    case "F":
                        tofOption = 2 * tofOrder + 1;
                        break;
                    default:
                        throw new Error("tof????????????");
                }
                tofOnPaper[tofOption].click();

                tofOrder++;
                break;
            case "et-blank": //???????????????
                ready_in(blankOnPaper[blankOrder]);
                blankOnPaper[blankOrder].textContent = answer.text;
                // (blankOnPaper[blankOrder] as HTMLSpanElement).value = answer.text;
                event_trigger(blankOnPaper[blankOrder]);

                blankOrder++;
                break;
            case "et-textarea": //????????????
                if (answer.text.length) {
                    ready_in(textareaOnPaper[textareaOrder]);
                    textareaOnPaper[textareaOrder].textContent = answer.text;
                    textareaOnPaper[textareaOrder].value = answer.text;
                    event_trigger(textareaOnPaper[textareaOrder]);
                } //???et-blank?????????????????????????????????

                textareaOrder++;
                break;
            case "et-select":
                selectOnPaper[selectOrder].classList.add("correct");
                // ready_in(selectOnPaper[selectOrder].querySelector('.key'));
                selectOnPaper[selectOrder].querySelector("select")!.click();
                // selectOnPaper[selectOrder].querySelector(".key").click();
                angular
                    .element(selectOnPaper[selectOrder].querySelector(".key"))
                    .triggerHandler("change");
                // angular.element(element).triggerHandler('');
                event_trigger(selectOnPaper[selectOrder].querySelector(".key") as HTMLElement);

                selectOrder++;
                break;
            case "et-choice":
                let targetOption, options, optionCount;
                let spanFlag = false;

                try {
                    options = answer.text.split(",");
                } catch (error) {
                    options = ["1"]; //???????????????????????????
                }
                console.log(options);

                if (!(optionCount = answer.element.querySelectorAll("li").length)) {
                    optionCount = answer.element.querySelectorAll("span").length;
                    if (optionCount) {
                        spanFlag = true;
                        optionOrder = spanOrder; //??????????????????li???span????????????????????????li???span????????????
                    } else {
                        optionCount = 4; //?????????????????????2Practice Test One
                    }
                } else {
                    optionOrder = liOrder;
                }

                for (let option of options) {
                    if (isNaN(parseInt(option))) {
                        //key?????????
                        targetOption =
                            optionCount * optionOrder + option.toUpperCase().charCodeAt() - 65;
                    } else {
                        //key?????????
                        targetOption = optionCount * optionOrder + parseInt(option) - 1;
                    }

                    console.log(
                        `??????${optionOrder} span${spanOrder} ??????${targetOption} ?????????${optionCount}`,
                    );
                    if (spanFlag && optionCount) {
                        try {
                            optionSpanOnPaper[targetOption].click();
                        } catch (error) {
                            optionOnPaper[targetOption].click();
                        }
                    } else {
                        optionOnPaper[targetOption].click();
                    }
                }

                if (spanFlag) {
                    spanOrder++;
                } else {
                    liOrder++;
                }
                optionOrder++;

                break;
            case "et-matching":
                for (
                    let matchingOrder = 0;
                    matchingOrder < answer.element.getAttribute("key").split(",").length;
                    matchingOrder++
                ) {
                    await sleep(store.USER_SETTINGS.solveInterval);
                    let targetCircle =
                        answer.element
                            .getAttribute("key")
                            .split(",")
                            [matchingOrder].split("-")[1] - 1;
                    let x1 = leftCircles[matchingOrder].getAttribute("cx");
                    let y1 = leftCircles[matchingOrder].getAttribute("cy");
                    let x2 = rightCircles[targetCircle].getAttribute("cx");
                    let y2 = rightCircles[targetCircle].getAttribute("cy");

                    // ready_in(leftCircles[matchingOrder]);
                    // ready_in(rightCircles[targetCircle]);
                    lineElements[matchingOrder].innerHTML = `
                    <line 
                        ng-class="{incorrect:!matching.isKey($parent.$index,b)}"
                        ng-click="matching.removeLine($parent.$index, b)" 
                        ng-repeat="b in cb track by $index" 
                        ng-attr-x1="{{matching.circles.xA}}"
                        ng-attr-x2="{{matching.circles.xB}}" 
                        ng-attr-y1="{{matching.circles.A[$parent.$index]}}" 
                        ng-attr-y2="{{matching.circles.B[b]}}"
                        x1="${x1}" 
                        x2="${x2}" 
                        y1="${y1}" 
                        y2="${y2}" 
                        class=""
                    ></line>`;
                    // event_trigger(lineElements[matchingOrder]);
                    // event_trigger(leftCircles[matchingOrder]);
                    // event_trigger(rightCircles[targetCircle]);
                    // event_trigger(document.querySelector('g.aidLine line'))
                }

                break;
        }
    }
}
