// add id and ref to object field when get game list data from firestore
export const gameDataConverter = {
  fromFirestore(snapshot, options) {
    const data = snapshot.data(options);
    return { ...data, id: snapshot.id, ref: snapshot.ref };
  },
  toFirestore(data) {
    return data;
  },
};