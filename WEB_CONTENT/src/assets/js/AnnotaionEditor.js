import VirtualInterface from './interfaces/VirtualInterface.js'
import DrawableInterface from './interfaces/DrawableInterface.js'
import CanvasShareableInterface from './interfaces/CanvasShareableInterface.js'

let privateVariables = {
	canvas: {},
	config: {
		lineWidth: 5,
		strokeStyle:
			"#df4b26",
		lineColor:
			"#000000",
		fillStyle:
			"blue",
		globalAlpha:
			0.3,
	},
	isLastSubmitLoading: false,
	annotation: {},
	editedAnnotation: new Map(),
	/*
	 * tag.html : string,
	 * tag.text : string,
	 * tag.index : number
	 */
	tag: new Map(),
	tagHtml: new Map(),
	isEdited: new Map(),
	// deletedTagCounter: 0
};
let privateMethods = {
	clearCanvas() {
		let context;
		context = privateVariables.canvas.getContext('2d');
		context.clearRect(0, 0, privateVariables.config.defaultWidth, privateVariables.config.defaultHeight);
		privateVariables.viewer.drawCurrent(privateVariables.header);
	},
	drawThis: function (marking) {
		let context, currentAnnotation, markingType, header;
		header = privateVariables.header;
		context = privateVariables.canvas.getContext('2d');

		context.strokeStyle = privateVariables.config.color;
		context.lineWidth = privateVariables.config.lineWidth;
		context.clearRect(0, 0, privateVariables.config.defaultWidth, privateVariables.config.defaultHeight);

		//重新一次前面的標註, 之後再畫新的標註, 放在回調函數裡是因為drawCurrent可能要輪詢等待上一次的請求結束才執行
		privateVariables.viewer.drawCurrent(header, () => {
			privateVariables.markingDrawingStrategy.drawThis(context, marking, privateVariables.config)
		});
		// markingType = privateVariables.markingDrawingStrategy.getMarkingTypeName();
		// currentAnnotation = this.getCurrentEditedAnnotation();
		// currentAnnotation[markingType].forEach((value, index, array) => {
		// 	privateVariables.markingDrawingStrategy.drawThis(context, value, privateVariables.config)
		// })
		// privateVariables.markingDrawingStrategy.drawThis(context, marking, privateVariables.config)
	},
	submitCurrent(annotation, callback = function () {
	}) {
		let router, header, http;
		console.log("sumbit")
		header = privateVariables.header;
		http = privateVariables.http;
		// data = this.getSubmitData();
		privateVariables.isLastSubmitLoading = true;
		if (privateVariables.viewer.isCurrentAnnotationNew()) {
			router = privateVariables.postBaseUrl + privateVariables.id;
			http.post(router, annotation, header)
				.then((response) => {
				})
				.catch((error) => {
					console.log(error);
				})
				.finally(() => {
					privateVariables.isLastSubmitLoading = false;
					callback();
				})
		} else {
			router = privateVariables.putBaseUrl;
			http.put(router, annotation, header)
				.then((response) => {
				})
				.catch((error) => {
					console.log(error);
				})
				.finally(() => {
					privateVariables.isLastSubmitLoading = false;
					callback();
				})
		}
	},
	getCurrentEditedAnnotation() {
		return privateVariables.editedAnnotation.get(privateVariables.viewer.shareCurrentImageName());
	},
	initTagHtml(annotation) {
		let markingType, marking, tagHtml = "", currentImageName/*, deleteTagCounter*/;
		// deleteTagCounter = privateVariables.deletedTagCounter;
		currentImageName = privateVariables.viewer.shareCurrentImageName();
		markingType = privateVariables.markingDrawingStrategy.getMarkingTypeName();
		marking = annotation[markingType];

		if (marking !== null && marking !== undefined) {
			marking.forEach((value, index, array) => {
				tagHtml += privateVariables.markingDrawingStrategy.addTag(privateVariables.canvas, value, index/* + deleteTagCounter*/);
			});
			privateVariables.tagHtml.set(currentImageName, tagHtml);
			privateVariables.tagUpdateWay();
		}
	},
	initTagText(annotation) {
		privateVariables.tagTextUpdateWay();
	},
	getSubmitData() {
		//....
		let markingType, annotation;
		markingType = privateVariables.markingDrawingStrategy.getMarkingTypeName();
		annotation = this.getCurrentEditedAnnotation();
		return annotation;
	},
	addOneMarking(caller, marking) {
		let markingTypeName, length, currentTagHtml, currentImageName,
			currentTotalTagHtml, annotation, context;
		context = privateVariables.canvas.getContext("2d");
		context.clearRect(0, 0, privateVariables.config.defaultWidth, privateVariables.config.defaultHeight);
		markingTypeName = privateVariables.markingDrawingStrategy.getMarkingTypeName();
		currentImageName = privateVariables.viewer.shareCurrentImageName();
		annotation = this.getCurrentEditedAnnotation();
		annotation[markingTypeName].push(marking);
		length = this.getCurrentEditedAnnotation()[markingTypeName].length - 1;
		currentTagHtml = privateVariables.markingDrawingStrategy.addTag(privateVariables.canvas, marking, length);
		currentTotalTagHtml = caller.shareTag();
		if (currentTotalTagHtml === null || currentTotalTagHtml === undefined) {
			currentTotalTagHtml = currentTagHtml;
		} else {
			currentTotalTagHtml += currentTagHtml;
		}
		privateVariables.tagHtml.set(currentImageName, currentTotalTagHtml);
		privateVariables.editedAnnotation.set(currentImageName, annotation);
		privateVariables.isEdited.set(currentImageName, true);
		// privateVariables.viewer.forceUpdate(currentImageName);
		// this.submitCurrent(() => {
		this.drawThis(marking);
		// });
		privateVariables.tagUpdateWay();
		privateVariables.tagTextUpdateWay();
	},
	haveThisEditedAnnotation(imageName) {
		let annotation;
		annotation = privateVariables.editedAnnotation.get(imageName);
		return undefined != annotation || null != annotation;
	}
};

class AnnotationEditor {
	constructor(annotationViewer, header, postBaseUrl, putBaseUrl, id, http) {
		/* 檢查參數 */
		if (typeof postBaseUrl !== "string")
			throw new Error("AnnotationEditor's constructor viewer expected a postBaseUrl of string, but got a " + typeof baseUrl);

		if (typeof putBaseUrl !== "string")
			throw new Error("AnnotationEditor's constructor viewer expected a putBaseUrl of string, but got a " + typeof baseUrl);

		if (typeof id !== "string" && typeof id !== "number")
			throw new Error("AnnotationEditor's constructor viewer expected a id of string, but got a " + typeof id);

		// if (baseUrl[baseUrl.length - 1] !== "/")
		// 	throw new Error("AnnotationViewer's constructor: baseUrl should included the last '/'");

		if (header === null || header === undefined)
			throw new Error("AnnotationEditor's constructor: head is null or undefined");

		VirtualInterface.ensureImplements(annotationViewer, DrawableInterface);
		VirtualInterface.ensureImplements(annotationViewer, CanvasShareableInterface);

		privateVariables.id = id;
		privateVariables.http = http;
		privateVariables.header = header;
		privateVariables.putBaseUrl = putBaseUrl;
		privateVariables.postBaseUrl = postBaseUrl;
		privateVariables.viewer = annotationViewer;
		privateVariables.canvas = annotationViewer.shareCanvas();
		privateVariables.annotation = annotationViewer.shareCurrentAnnotation();
		privateVariables.markingDrawingStrategy = annotationViewer.shareMarkingDrawingStrategy();
		privateVariables.config.defaultHeight = annotationViewer.shareHeight();
		privateVariables.config.defaultWidth = annotationViewer.shareWidth();
	}

	drawCurrent(header, callback = function () {
	}) {
		let id, doIt, currentAnnotation, currentImageName, markingType;
		doIt = () => {
			let marking;
			currentImageName = privateVariables.viewer.shareCurrentImageName();
			if (privateMethods.haveThisEditedAnnotation(currentImageName)) {
				markingType = privateVariables.markingDrawingStrategy.getMarkingTypeName();
				currentAnnotation = privateMethods.getCurrentEditedAnnotation();
				if (currentAnnotation[markingType] === undefined || currentAnnotation[markingType].length === 0) {
					privateMethods.clearCanvas();
				}
				for (marking of currentAnnotation[markingType]) {
					privateMethods.drawThis(marking);
				}
			} else {
				// 先畫圖, 再畫標註, 畫完標註取得現在的標註
				privateVariables.viewer.drawCurrent(header, () => {
					currentAnnotation = privateVariables.viewer.shareCurrentAnnotation();
					currentImageName = privateVariables.viewer.shareCurrentImageName();
					privateVariables.editedAnnotation.set(currentImageName, currentAnnotation);
					privateVariables.isEdited.set(currentImageName, false);
					callback();
					privateMethods.initTagHtml(currentAnnotation);
					privateMethods.initTagText(currentAnnotation);
				});
			}
		};
		if (privateVariables.isLastSubmitLoading === false) {
			doIt()
		} else {
			id = setInterval(() => {
				if (privateVariables.isLastSubmitLoading === false) {
					doIt();
					clearInterval(id);
				}
			})
		}
		return this;
	}

	drawNext(callback = function () {
	}) {
		let id, doIt, defaultCallback, isNeedToSubmit, currentImageName;
		doIt = () => {
			// let marking, markingType, currentAnnotation;
			defaultCallback = () => {
				this.drawCurrent(privateVariables.header, callback);
				// editedAnnotation.size - 1表達現在的annotation數量
				privateVariables.tagUpdateWay();
				privateVariables.tagTextUpdateWay();
			};
			privateVariables.viewer.drawNext(defaultCallback) // 提交完當前標註再跳轉下一張
		}
		;
		if (privateVariables.isLastSubmitLoading === false) {
			doIt();
		} else {
			id = setInterval(() => {
				if (privateVariables.isLastSubmitLoading === false) {
					doIt();
					clearInterval(id);
				}
			}, 50);
		}
	}

	drawPrevious(callback = function () {
	}) {
		let id, doIt, defaultCallback;
		doIt = () => {
			defaultCallback = () => {
				this.drawCurrent(privateVariables.header, callback);
				privateVariables.tagUpdateWay();
				privateVariables.tagTextUpdateWay();
			};
			privateVariables.viewer.drawPrevious(defaultCallback) // 提交完當前標註再跳轉下一張
		};
		if (privateVariables.isLastSubmitLoading === false) {
			doIt();
		} else {
			id = setInterval(() => {
				if (privateVariables.isLastSubmitLoading === false) {
					doIt();
					clearInterval(id);
				}
			}, 50);
		}
	}

	handleMouseDown(e) {
		let marking;
		marking = privateVariables.markingDrawingStrategy.generateMarkingAfterMouseDown(e);
		if (null !== marking && undefined !== marking) {
			privateMethods.drawThis(marking);
		}
	}

	handleMouseUp(e) {
		let marking;
		marking = privateVariables.markingDrawingStrategy.generateMarkingAfterMouseUp(e);
		if (null !== marking && undefined !== marking) {
			privateMethods.addOneMarking(this, marking);
			privateMethods.drawThis(marking);
		}
	}

	handleMouseMove(e) {
		let marking;
		marking = privateVariables.markingDrawingStrategy.generateMarkingAfterMouseMove(e)
		if (null !== marking && undefined !== marking) {
			privateMethods.drawThis(marking);
		}
	}

	deleteTag(index) {
		let annotation, markingTypeName, currentImageName, id, doIt;
		doIt = () => {
			currentImageName = privateVariables.viewer.shareCurrentImageName();
			annotation = privateMethods.getCurrentEditedAnnotation();
			markingTypeName = privateVariables.markingDrawingStrategy.getMarkingTypeName();
			if (index > annotation[markingTypeName].length) {
				return;
			}
			if (annotation[markingTypeName].length === 1) {
				annotation[markingTypeName] = [];
			}
			else {
				annotation[markingTypeName].splice(index, 1);
			}
			privateVariables.editedAnnotation.set(currentImageName, annotation);
			privateVariables.isEdited.set(currentImageName, true);
			// privateMethods.submitCurrent(() => {
			this.drawCurrent(privateVariables.header);
			// });
			privateMethods.initTagHtml(annotation);
			privateMethods.initTagText(annotation);
		}
		if (privateVariables.isLastSubmitLoading === false) {
			doIt();
		} else {
			id = setInterval(() => {
				if (privateVariables.isLastSubmitLoading === false) {
					doIt();
					clearInterval(id);
				}
			}, 50)
		}
	}


	shareTag() {
		let currentImagename;
		currentImagename = privateVariables.viewer.shareCurrentImageName();
		return privateVariables.tagHtml.get(currentImagename);
	}

	shareTagText() {
		let tagText = new Array(), item, markingTypeName, i = 0, annotation;
		annotation = privateMethods.getCurrentEditedAnnotation()
		markingTypeName = privateVariables.markingDrawingStrategy.getMarkingTypeName();
		if (annotation[markingTypeName] === null || annotation[markingTypeName] === undefined)
			return {text: "", index: 0}
		for (item of annotation[markingTypeName]) {
			// text = (item.tag === null || item.tag === undefined ? "" : item.tag);
			tagText.push({text: item.tag, index: i});
			i++;
		}
		return tagText;//.push(privateVariables.viewer.shareTagText());
	}

	setTagUpdateCallback(callback) {
		privateVariables.tagUpdateWay = callback;
	}

	setTagTextUpdateCallback(callback) {
		privateVariables.tagTextUpdateWay = callback;
	}

	setTagTextGettingCallback(callback) {
		privateVariables.tagTextGettingCallback = callback;
	}

	isCurrentAnnotationEdited() {
		return privateVariables.isEdited.get(privateVariables.viewer.shareCurrentImageName());
	}

	forceUpdate(tagTexts) {
		let currentImageName, annotation, markingType, i, doIt, id;
		doIt = () => {
			currentImageName = privateVariables.viewer.shareCurrentImageName();
			annotation = privateMethods.getCurrentEditedAnnotation();
			markingType = privateVariables.markingDrawingStrategy.getMarkingTypeName();
			i = 0;
			for (let item of tagTexts) {
				if (annotation[markingType][i] !== undefined) {
					annotation[markingType][i].tag = item.text;
					i++;
				}
			}
			privateVariables.editedAnnotation.set(currentImageName, annotation);
			privateVariables.isEdited.set(currentImageName, false);
			// privateMethods.submitCurrent(() => {
			// 	privateVariables.viewer.forceUpdate(currentImageName);
			// 	privateVariables.isEdited.set(currentImageName, false);
			// })
		}
		if (privateVariables.isLastSubmitLoading === false) {
			doIt();
		} else {
			id = setInterval(() => {
				if (privateVariables.isLastSubmitLoading === false) {
					doIt();
					clearInterval(id);
				}
			}, 50)
		}
	}

	setAnswerPairs(answerPairs) {
		let annotation, markingType, currentImageName;
		currentImageName = privateVariables.viewer.shareCurrentImageName();
		markingType = privateVariables.markingDrawingStrategy.getMarkingTypeName();
		annotation = privateMethods.getCurrentEditedAnnotation();
		annotation[markingType] = answerPairs;
		privateVariables.editedAnnotation.set(currentImageName, annotation);
	}

	submitCurrent(annotationSize) {
		let editedAnnotations, markingType;
		editedAnnotations = privateVariables.editedAnnotation;
		if (annotationSize !== editedAnnotations.size) {
			return false;
		}
		markingType = privateVariables.markingDrawingStrategy.getMarkingTypeName();
		editedAnnotations.forEach((value, key, map) => {
			/**
			 *  第一個和第二個是判斷沒有annotation, 若沒有即是新的且沒有做過
			 *  第三個是判斷是否原本是有做的, 但把marking都刪掉了
			 */
			if (null === value || undefined === value || null === value[markingType] || undefined === value[markingType]) {
				return false;
			}
			value[markingType].forEach((marking, index, array) => {
				if (privateVariables.markingDrawingStrategy.isMarkingEmpty(marking)) {
					return false;
				}
			});
		});
		// 全部annotation都做完了
		console.log(editedAnnotations);
		editedAnnotations.forEach((value, key, map) => {
			console.log("now submitting :");
			console.log(value);
			privateMethods.submitCurrent(value);
		});
		return true;
	}
}

export default AnnotationEditor;