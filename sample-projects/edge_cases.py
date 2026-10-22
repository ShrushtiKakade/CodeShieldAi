"""
Edge Case Fixture for CodeShield AI
Tests parser robustness against false positives, comments, and syntax quirks.
"""

def ui_action_handler():
    # Edge case 1: Method named select() that is NOT a database query
    class UIElement:
        def select(self, item_name):
            return f"Selected {item_name}"
    
    elem = UIElement()
    result = elem.select("option_a")
    return result


def form_input_names():
    # Edge case 2: Variable containing 'password' or 'token' in form labels, not a secret
    password_input_id = "login_password_field"
    token_header_name = "X-CSRF-Token"
    return {"field": password_input_id, "header": token_header_name}


# Edge case 3: Comment containing SQL keywords
# SELECT * FROM users WHERE admin = 1
def safe_calculator(a: int, b: int) -> int:
    return a + b
