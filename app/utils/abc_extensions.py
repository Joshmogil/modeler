# You could place this in a new file like 'app/utils/abc_extensions.py'
import abc
import inspect
from typing import Type

class SignatureEnforcingABC(abc.ABC):
    """
    An Abstract Base Class that enforces method signatures at class creation time.

    When a class inherits from this one, it will check that all implemented
    abstract methods have the exact same function signature (including parameter
    names, types, and return type) as the abstract method in the parent.
    """
    def __init_subclass__(cls: Type, **kwargs):
        super().__init_subclass__(**kwargs)

        # Iterate through all parent classes in the method resolution order
        for base in cls.__mro__:
            # Skip the class itself and the object base class
            if base is cls or base is object:
                continue

            # Check only for abstract methods defined in the parent
            if hasattr(base, "__abstractmethods__"):
                for method_name in base.__abstractmethods__:
                    # Ensure the method is actually implemented on the new subclass
                    if not hasattr(cls, method_name):
                        continue # The standard ABC check will catch this at instantiation

                    # Get the abstract method from the parent and the implementation from the child
                    abstract_method = getattr(base, method_name)
                    implemented_method = getattr(cls, method_name)

                    # Get their signatures
                    try:
                        sig_abstract = inspect.signature(abstract_method)
                        sig_implemented = inspect.signature(implemented_method)
                    except TypeError:
                        # This can happen with properties or other non-function objects
                        continue

                    # Compare the signatures
                    if sig_abstract != sig_implemented:
                        raise TypeError(
                            f"Signature mismatch in '{cls.__name__}.{method_name}'.\n"
                            f"Expected: {sig_abstract}\n"
                            f"Got:      {sig_implemented}\n"
                            f"Class '{cls.__name__}' does not correctly implement abstract method '{method_name}' from '{base.__name__}'."
                        )