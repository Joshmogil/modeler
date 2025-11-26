import inspect
from contextvars import ContextVar
from abc import ABCMeta

# ---------- Task-local instantiation stack ----------
_instantiation_stack: ContextVar[list[type]] = ContextVar("_inst_stack", default=[])

# ---------- Utilities ----------
def _unwrap_callable(obj):
    """Return (kind, func) where kind ∈ {'function','classmethod','staticmethod','property'}."""
    if isinstance(obj, property):
        return "property", inspect.unwrap(obj.fget) if obj.fget else None
    if isinstance(obj, classmethod):
        return "classmethod", inspect.unwrap(obj.__func__)
    if isinstance(obj, staticmethod):
        return "staticmethod", inspect.unwrap(obj.__func__)
    return "function", inspect.unwrap(obj)

def _mark_required(attr):
    kind, func = _unwrap_callable(attr)
    if func is None:
        raise TypeError("@required cannot decorate an empty property")
    setattr(func, "_is_required", True)
    if kind == "property":
        return property(func)
    if kind == "classmethod":
        return classmethod(func)
    if kind == "staticmethod":
        return staticmethod(func)
    return func

def required(attr):
    """Decorator to mark members that subclasses MUST implement with a compatible signature."""
    return _mark_required(attr)

def _is_required(attr) -> bool:
    _, func = _unwrap_callable(attr)
    return bool(getattr(func, "_is_required", False))

def _signature_of(attr):
    _, func = _unwrap_callable(attr)
    return inspect.signature(func) if func is not None else None

# ---------- Metaclass ----------
class InterfaceMeta(ABCMeta):
    """
    - Enforces that subclasses implement all @required members with matching signatures.
    - Detects construction cycles across the entire __call__ path (covers __new__ + __init__).
    """

    # Class creation hook (like __init_subclass__, but centralized and earlier in MRO)
    def __init__(cls, name, bases, namespace, **kw):
        super().__init__(name, bases, namespace, **kw)

        # Walk only base classes, stop at the Interface root or object
        for base in cls.__mro__[1:]:
            if base in (Interface, object):
                break

            for attr_name, base_attr in base.__dict__.items():
                if not _is_required(base_attr):
                    continue

                # Must be explicitly overridden in cls (not merely inherited)
                sub_attr = cls.__dict__.get(attr_name)
                if sub_attr is None:
                    raise NotImplementedError(
                        f"{cls.__name__} must implement required member '{attr_name}' declared in {base.__name__}"
                    )
                if sub_attr is base_attr:
                    raise NotImplementedError(
                        f"{cls.__name__} must override required member '{attr_name}' from {base.__name__}"
                    )

                base_sig = _signature_of(base_attr)
                sub_sig  = _signature_of(sub_attr)
                if base_sig is None or sub_sig is None:
                    raise TypeError(f"Unable to inspect signature for required member '{attr_name}'")

                if base_sig != sub_sig:
                    raise TypeError(
                        f"Signature mismatch for '{cls.__name__}.{attr_name}': "
                        f"{sub_sig} != required {base_sig} from '{base.__name__}.{attr_name}'"
                    )

    # Instance construction hook (covers both allocation and initialization)
    def __call__(cls, *args, **kwargs):
        stack = _instantiation_stack.get()

        if cls in stack:
            # Present the smallest repeating cycle for intelligibility
            i = stack.index(cls)
            cycle = " -> ".join(c.__name__ for c in stack[i:] + [cls])
            raise RuntimeError(f"Circular dependency detected: {cycle}")

        token = _instantiation_stack.set(stack + [cls])
        try:
            return super().__call__(*args, **kwargs)
        finally:
            _instantiation_stack.reset(token)

# ---------- Public base ----------
class Interface(metaclass=InterfaceMeta):
    """Derive from this to get signature enforcement and cycle detection, without touching __new__."""
    pass