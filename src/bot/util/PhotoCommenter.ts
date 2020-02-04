const labelCommentMap = {
  "cat|cats": "Aff, foto de gato denovo!",
  hamburger: "Meu deus! Um Hamburguer ia cair bem!!!",
  sushi: "Sushiiiiiii!!!",
  food: "Opa! Comida!!!",
  "drink|drinking": "Sempre bebendo...",
  "kayak|water":
    "Queria eu estar curtindo a água, mas isso iria fritar meus circuitos...",
  male: "Que homem...",
  "female|beauty": "Olá gatinha...",
  "people|face": "Quem é esse feio?"
};

class PhotoCommenter {
  commentPhoto(photoInfo): string {
    const labels = photoInfo.labelAnnotations;

    let photoComment = null;
    for (let labelComment in labelCommentMap) {
      const labelCommentParts = labelComment.split("|");

      for (let label of labels) {
        const description = label.description.toLowerCase();

        if (labelCommentParts.includes(description)) {
          photoComment = labelCommentMap[labelComment];
          break;
        }
      }

      if (photoComment) {
        break;
      }
    }

    if (photoComment) {
      //return photoComment;
    }

    const texts = photoInfo.textAnnotations;

    if (texts.length > 0) {
      const description = texts[0].description.toLowerCase();

      return description;
    }
  }
}

export default PhotoCommenter;
