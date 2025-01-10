/*
  Author: Michael John Larido
  JS Practice Day 02
  January 04, 2025 A.D.
  Project Name: NeoCalculaziser
*/

const calculator = {
  arg1: null, // First operand for calculations
  arg2: null, // Second operand for calculations
  result: null, // Stores the result of a calculation
  operand: '', // Stores the operator (+, -, *, /)
  argState: false, // Tracks if the first argument is being set
  operandState: false, // Tracks if an operator is set
  resultState: false, // Tracks if the result is displayed
  errorState: false, // Tracks if an error occurred (e.g., division by zero)

  formatResult: function() {
    let result = this.result;
    const absValue = Math.abs(result);
    
    // Very small numbers handling (<1e-5)
    if (absValue > 0 && absValue < 0.00001) {
      result = result.toExponential(2);
    }
    // Small decimals (>=0.00001 and <0.1)
    else if (absValue >= 0.00001 && absValue < 0.1) {
      // For numbers that would be too long in decimal format
      if (result.toString().length > 8) {
        let precision = 7;
        // Adjust precision based on number size to avoid scientific notation
        while (precision > 1) {
          let formatted = result.toPrecision(precision);
          if (!formatted.includes('e') && formatted.length <= 8) {
            result = formatted;
            break;
          }
          precision--;
        }
        // If we couldn't format it properly, use scientific notation
        if (precision <= 1) {
          result = result.toExponential(2);
        }
      }
    }
    // Regular numbers that are too long
    else if (result.toString().length > 8) {
      result = result.toPrecision(7);
    }
    
    // Convert to string and clean up
    result = result.toString();
    
    // Clean up scientific notation if present
    if (result.includes('e')) {
      const [base, exponent] = result.split('e');
      const cleanBase = parseFloat(base).toPrecision(3);
      result = `${cleanBase}e${exponent}`;
    } else {
      // Remove trailing zeros after decimal
      result = result.replace(/\.?0+$/, '');
      // Remove trailing decimal point
      if (result.endsWith('.')) {
        result = result.slice(0, -1);
      }
    }
    
    this.result = result;
  },

  // Performs the calculation based on the selected operator
  calculate: function() {
    switch(this.operand) {
      case '+':
        this.result = Number.parseFloat(this.arg1) + Number.parseFloat(this.arg2);
        break;
      case '-':
        this.result = this.arg1 - this.arg2;
        break;
      case '*':
        this.result = this.arg1 * this.arg2;
        break;
      case '/':
        this.result = this.arg1 / this.arg2;
        // Handle division errors (e.g., division by zero)
        if(isNaN(this.result) || !isFinite(this.result)) {
          this.result = 'Syntax Error!!';
          this.errorState = true;
        };
        break;
    }

    // Adjust the display if the result is too large or format it
    if(typeof this.result == 'number') {
      if(this.result > 99999999) {
        this.result = this.result.toExponential(2); // Converts to scientific notation
      }
      else this.formatResult();
    }

    // Prepare for a new calculation by shifting result to `arg1`
    this.arg1 = this.result;
    this.arg2 = null;
    this.result = null;
    this.argState = false;
    this.resultState = true; // Mark result as ready to display
  },

  // Resets the calculator to its default state
  reset: function() {
    this.arg1 = null;
    this.arg2 = null;
    this.result = null;
    this.operand = '';
    this.argState = false;
    this.operandState = false;
    this.resultState = false;
    this.errorState = false;
  }
};

// Checks if the input key corresponds to a valid operator or control key
function isOperand(input) {
  const operands = ['+', '-', '*', '/', '=', 'Enter', 'Delete'];
  for(let i = 0; i < operands.length; i++) {
    if(input == operands[i]) return true; // Return true for valid operators or special keys
  }
  return false;
}

// Validates if the input key is a number, operator, or special control key
function validateInput(keypress) {
  const specials = ['.', '+', '-', '*', '/', '=', 'Enter', 'Backspace', 'Delete'];
  for(let i = 0; i < specials.length; i++) {
    if(keypress == specials[i]) return true;
  }
  if(Number.isInteger(Number.parseInt(keypress))) return true; // Allow digits
  return false;
}

// Visually highlights the pressed key
function toogleKeypress(keypress) {
  if(keypress == 'Enter') keypress = '=';
  const key = document.querySelector('.key[data-key="'+ keypress +'"]');
  key.classList.add('active'); // Add an "active" class for visual feedback
}

// Handles user input and manages calculator states
function handleInput(keypress) {
  const screen = document.querySelector('.screen');
  let output = screen.textContent;

  if(isOperand(keypress)) {
    if(keypress == 'Delete') { // Resets the calculator if "Delete" is pressed
      calculator.reset();
      output = '0';
      screen.textContent = output;
      return;
    }
    
    if(!calculator.argState && !calculator.operandState) return; // Ignore invalid operand inputs

    if(!calculator.operandState) {
      if(keypress == '=' || keypress == 'Enter') { // Handle "=" to calculate the result
        if(calculator.arg1 == null && calculator.arg2 == null) return;
        calculator.arg2 = output; // Assign second operand
        calculator.calculate(); // Perform the calculation
        output = calculator.arg1; // Display the result
      } else { // Handle operator inputs (+, -, *, /)
        if(calculator.arg1 == null) {
          calculator.arg1 = output; // Assign first operand
          calculator.operand = keypress; // Set the operator
          output = '0'; // Reset screen for the next input
          calculator.argState = false;
        } else {
          calculator.arg2 = output; // Assign second operand
          calculator.calculate(); // Perform the calculation
          output = calculator.arg1; // Display the result
          calculator.resultState = false;
        }
      }
      calculator.operandState = true; // Mark operator as set
    } else {
      if(keypress == '=') return; // Ignore "=" if an operator is already set
      calculator.operand = keypress; // Update the operator
      calculator.resultState = false;
    }
  } else { // Handle number or special inputs (e.g., Backspace, decimal point)
    if(calculator.resultState || calculator.errorState) {
      calculator.reset(); // Reset on new input after result/error
      output = '0';
    }

    if(!calculator.argState) { // Handle the first operand input
      output = '0'; // Initialize the screen display
      screen.textContent = output;
      switch(keypress) {
        case '.': // Append a decimal point
          output += keypress;
          calculator.argState = true;
          break;
        case 'Backspace': // Clear the screen
          calculator.argState = false;
          break
        default: // Handle digit input
          output = keypress;
          calculator.argState = true;
          break;
      }
    } else { // Handle additional inputs for the current operand
      switch(keypress) {
        case '.': // Prevent multiple decimal points
          if(output.length > 7) return; // Prevent overflow
          let count = output.lastIndexOf('.');
          if(count != -1) return;
          output += keypress;
          break;
        case 'Backspace': // Remove the last character
          output = output.substring(0, output.length - 1);
          if(output.length == 0) {
            output = '0'; // Reset display if empty
            calculator.argState = false;
          }
          break;
        default: // Append a digit
          if(output.length == 8) return; // Prevent overflow
          output += keypress;
          break;
      }
    }
    
    calculator.operandState = false; // Reset operator state
  }

  screen.textContent = output; // Update the screen
}

// Listens for keyboard input and processes it if valid
window.addEventListener('keydown', function(e) {
  if(!validateInput(e.key)) return; // Ignore invalid keys
  toogleKeypress(e.key); // Highlight the pressed key
  handleInput(e.key); // Process the input
});

// Handles the end of the "active" visual effect for keypresses
const keys = Array.from(document.querySelectorAll('.key'));
keys.forEach(key => key.addEventListener('transitionend', function(e) {
  if(e.propertyName != 'transform') return; // Ignore non-transform transitions
  e.target.classList.remove('active'); // Remove "active" class
}));

// Adds click event listeners to calculator keys
keys.forEach(key => key.addEventListener('click', function(e) {
  let input = e.target.getAttribute('data-key'); // Get the associated key value
  handleInput(input); // Process the input
}));