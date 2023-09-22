

// testSaveAuthors();

// interface SetTestInterface {
//   name: string,
//   password: string
// }

// class SetTest {
//   _name: string;
//   _email: string;
//   _password: string;

//   constructor(props: SetTestInterface) {
//     this._password = props.password;
//     this._name = props.name
//   }

//   get email() {
//     return this._email
//   }

//   set email(value: string | null) {
//     let nameForEmail;
//     const nameM = this._name.trim().split(' ');
//     if (nameM.length >= 2) {
//       nameForEmail = nameM.splice(0, 2).join('_');
//     } else {
//       nameForEmail = nameM[0];
//     }
//     this._email = nameForEmail + '@lms.com'
//   }

//   generateRandom = () => {

//     return new Promise((resolve, reject) => {
//       let result = '';

//       const chars = process.env.RANDOM_CHARACTERS;
//       const charsLength = chars?.length;

//       let count = 0;

//       while (count < 10) {
//         result += chars?.charAt(Math.floor(Math.random() * (charsLength ?? 10)));
//         count += 1;
//       }
//       resolve(result);
//     })
//   }
// }

// // const prop = { name: ' taiwo peter ', password: 'password' }

// // const set1 = new SetTest(prop);
// // set1.email = 'tee';
// // console.log(set1.email, set1._email);

// // set1.generateRandom()
// //   .then((res) => {
// //     console.log(res);
// //   })
const today = new Date();
console.log(today);