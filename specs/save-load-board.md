# Feature: Save and Load Board State

Users can preserve interesting board configurations by saving them under a
name and reload them later. Saved boards persist between sessions, surviving page reloads.

---

## Scenario: Save the current board under a name

GIVEN the board has at least one alive cell
AND the user has typed a name in the save input field
WHEN the user confirms the save action by clicking the Save button or pressing Enter
THEN the board configuration appears in the saved-boards list with that name
AND the board on screen is unchanged

---

## Scenario: Save is disabled when the board is empty

GIVEN every cell on the board is dead
WHEN the user views the save controls
THEN the save action is not available

---

## Scenario: Load a board saved in the same session

GIVEN the board has some alive cells
AND the user saves the board as "My Pattern"
AND the user clears the board
WHEN the user clicks on "My Pattern" in the saved-boards list
THEN the board shows the alive cells that were present when "My Pattern" was saved
AND the generation counter resets to zero
AND the simulation is stopped

---

## Scenario: Load a board saved in a previous session

GIVEN the user has previously saved a board named "My Pattern"
AND the user reloads the page
AND the current board is empty
WHEN the user clicks on "My Pattern" in the saved-boards list
THEN the board updates to match the saved configuration
AND the generation counter resets to zero
AND the simulation is stopped

---

## Scenario: Saved boards persist across page reloads

GIVEN the user has saved a board named "Glider Loop"
WHEN the user reloads the page
THEN "Glider Loop" still appears in the saved-boards list
AND clicking on it restores the same configuration

---

## Scenario: No saved boards shows an empty state

GIVEN no boards have been saved
WHEN the user opens the save/load panel
THEN a message indicates there are no saved boards yet

---

## Scenario: Delete a saved board

GIVEN the user has saved a board named "Old Pattern"
WHEN the user deletes "Old Pattern"
THEN "Old Pattern" no longer appears in the saved-boards list

---

## Scenario: Duplicate name is rejected

GIVEN the user has already saved a board named "Test"
WHEN the user tries to save another board with the name "Test"
THEN an error message appears indicating the name is already taken
AND the existing "Test" save is not overwritten

---

## Scenario: Selected board is highlighted in the list

GIVEN the user has saved a board named "My Pattern"
WHEN the user clicks on "My Pattern" in the saved-boards list
THEN "My Pattern" is marked as selected in the list

---

## Scenario: Save controls are inactive during simulation

GIVEN the board has at least one alive cell
AND the simulation is running
WHEN the user views the save/load panel
THEN the save input is not available
AND the saved-boards list is not interactive
