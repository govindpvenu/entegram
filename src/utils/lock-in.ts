const LOCK_IN_PASSWORD_PATTERN =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{12}$/;

const UPPERCASE_CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWERCASE_CHARACTERS = "abcdefghijklmnopqrstuvwxyz";
const NUMBER_CHARACTERS = "0123456789";
const ALL_PASSWORD_CHARACTERS =
  UPPERCASE_CHARACTERS + LOWERCASE_CHARACTERS + NUMBER_CHARACTERS;

function getRandomCharacter(characters: string) {
  return characters[Math.floor(Math.random() * characters.length)];
}

export function isValidLockInPassword(value: string) {
  return LOCK_IN_PASSWORD_PATTERN.test(value);
}

export function generateLockInPassword() {
  const characters = [
    getRandomCharacter(UPPERCASE_CHARACTERS),
    getRandomCharacter(LOWERCASE_CHARACTERS),
    getRandomCharacter(NUMBER_CHARACTERS),
    ...Array.from({ length: 9 }, () =>
      getRandomCharacter(ALL_PASSWORD_CHARACTERS),
    ),
  ];

  for (let index = characters.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const currentCharacter = characters[index];

    characters[index] = characters[swapIndex];
    characters[swapIndex] = currentCharacter;
  }

  return characters.join("");
}

export function maskLockInPassword(value: string) {
  return `**** **** ${value.slice(-4)}`;
}
